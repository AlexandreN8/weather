#!/usr/bin/env python3
import asyncio
import httpx
import json
import logging
import yaml
import os
import time
from kafka import KafkaProducer, KafkaConsumer, TopicPartition
from aiolimiter import AsyncLimiter
from prometheus_client import start_http_server, Counter, Histogram, Gauge

# Collect almost real-time weather data from the observation API and publish it to Kafka
# API constraint : 50 requests per minute
# Number of stations : 2150 / 50 = 43 batches => ~45 minutes
# ~45 minutes before next refresh
# Request are shared between Meteo France APIs
# Need to wait while we retrieve api climatology data 

# -------------------------------------------------------------------
# CONFIGURATION AND LOGGING
# -------------------------------------------------------------------

# Configuration from YAML file
CONFIG_FILE = "config/config.yaml"
BATCH_FILE = "/app/utils/batches.json"
LOG_FILE = "logs/batch_processing.log"

with open(CONFIG_FILE, "r") as file:
    config = yaml.safe_load(file)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOG_FILE, mode="w", encoding="utf-8")
    ]
)

API_URL = config["api_url"]
API_TOKEN = os.getenv("API_TOKEN")
FETCH_TIMEOUT = config["fetch_timeout"]
MAX_CONCURRENT_REQUESTS = config["max_concurrent_requests"]
KAFKA_BROKER = os.environ.get("KAFKA_BROKER")
TOPIC_NAME = "weather-real-time"
STATUS_TOPIC = "climatologique-status"

producer = KafkaProducer(
    bootstrap_servers=KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    key_serializer=lambda k: str(k).encode('utf-8')
)

limiter = AsyncLimiter(50, 60)

# -------------------------------------------------------------------
# PROMETHEUS METRICS
# -------------------------------------------------------------------
# 0 = waiting, 1 = en service, empty = container is down
api_status = Gauge("api_status_observations", "Indicate API Observaitons status")

CURRENT_STATION = Gauge(
    'observation_current_station',
    'ID of the station currently being processed'
)

OBS_CYCLE_RUNS = Counter(
    'observation_cycle_runs_total',
    'Total number of observation cycles executed'
)

OBS_CYCLE_DURATION = Histogram(
    'observation_cycle_duration_seconds',
    'Duration of observation cycle in seconds'
)

OBS_FETCH_ATTEMPTS = Counter(
    'observation_fetch_attempts_total',
    'Total number of fetch attempts for observation API',
    ['station_id', 'status']  # status : "success", "error", "quota", etc.
)

OBS_FETCH_DURATION = Histogram(
    'observation_fetch_duration_seconds',
    'Duration of observation API fetch requests in seconds',
    ['station_id']
)

OBS_BATCH_PROCESSING_TIME = Histogram(
    'observation_batch_processing_seconds',
    'Duration of batch processing in observation API',
    ['batch_index']
)

OBS_STATIONS_PROCESSED = Gauge(
    'observation_stations_processed',
    'Number of stations processed in the current cycle'
)

OBS_DATA_VOLUME = Counter(
    'observation_data_volume_total',
    'Total volume of data retrieved from observation API',
    ['station_id']
)

start_http_server(8001)
print("Serveur Prometheus démarré sur le port 8001.")

# Initialize metrics with default values
stations = ["0"]
statuses = ["success", "error", "quota"]
for station in stations:
    for status in statuses:
        OBS_FETCH_ATTEMPTS.labels(station_id=station, status=status).inc(0)

# -------------------------------------------------------------------
# UTILITY FUNCTIONS FOR METRICS
# -------------------------------------------------------------------
def record_fetch_duration(station_id, start_time):
    elapsed = time.time() - start_time
    OBS_FETCH_DURATION.labels(station_id=station_id).observe(elapsed)
    return elapsed

def record_batch_duration(batch_index, start_time):
    elapsed = time.time() - start_time
    OBS_BATCH_PROCESSING_TIME.labels(batch_index=str(batch_index)).observe(elapsed)
    return elapsed

# -------------------------------------------------------------------
# UTILITY FUNCTIONS
# -------------------------------------------------------------------
async def fetch_station_data(station_id, retries=3):
    ''' Fetches weather data for a specific station. '''
    headers = {"apikey": API_TOKEN}
    params = {"id_station": station_id, "format": "json"}

    # Retry mechanism
    for attempt in range(1, retries + 1):
        async with httpx.AsyncClient(timeout=FETCH_TIMEOUT) as client:
            try:
                # use limiter to respect the API constraint including the retry
                async with limiter:
                    response = await client.get(f"{API_URL}/station/infrahoraire-6m", headers=headers, params=params)

                if response.status_code == 200:
                    OBS_FETCH_ATTEMPTS.labels(station_id=station_id, status="success").inc()
                    return response.json()

                elif response.status_code == 429:
                    logging.warning(f"Quota de requétes dépassé pour la station {station_id}.")
                    OBS_FETCH_ATTEMPTS.labels(station_id=station_id, status="quota").inc()
                    await asyncio.sleep(2 ** attempt)

                elif response.status_code in {500, 503}:
                    logging.warning(f"Requête échouée pour la station {station_id} (tentative {attempt}/{retries}). Réponse : {response.status_code}")
                    OBS_FETCH_ATTEMPTS.labels(station_id=station_id, status="error").inc()
                    await asyncio.sleep(2 ** attempt)

            except httpx.RequestError as exc:
                OBS_FETCH_ATTEMPTS.labels(station_id=station_id, status="error").inc()
                logging.error(f"Erreur réseau pour la station {station_id}: {exc}")
                await asyncio.sleep(2 ** attempt)

    OBS_FETCH_ATTEMPTS.labels(station_id=station_id, status="error").inc()
    logging.error(f"Échec final pour la station {station_id} après {retries} tentatives.")
    return None

async def fetch_and_publish_station_data(station, sem):
    """ Co-routine to fetch and publish weather data for a specific station. """
    async with sem:
        station_id = station["station_id"]
        await asyncio.sleep(1.2)

        CURRENT_STATION.set(station_id)
        start_time = time.time()
        raw_data = await fetch_station_data(station_id)
        record_fetch_duration(station_id, start_time)

        if raw_data:
            OBS_STATIONS_PROCESSED.inc()  # Inc number of processed stations in this cycle
            # Verify if the data is a list
            if isinstance(raw_data, list):
                # Enrich each data point with station metadata
                for data_point in raw_data:
                    enriched_data = {
                        "station_id": station_id,
                        "name": station.get("name"),
                        "type": station.get("type"),
                        "start_date": station.get("start_date"),
                        **data_point, # Merge the data point with the station metadata
                    }
                    # Increment the data volume metric
                    OBS_DATA_VOLUME.labels(station_id=station_id).inc(len(json.dumps(enriched_data)))
                    #  Publish the enriched data to Kafka
                    producer.send(TOPIC_NAME, key=station_id, value=enriched_data)
                    logging.info(f"Données publiées pour la station {station_id}: {json.dumps(enriched_data, indent=2)}")
            else:
                logging.error(f"Format inattendu des données pour la station {station_id}: {type(raw_data)}")

async def process_batch(batch, batch_index):
    """  Co-routine to process a batch of stations concurrently. """
    logging.info(f"--- Début du traitement du batch {batch_index + 1} ---")
    sem = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

    start_time = time.time()
    tasks = [
        asyncio.create_task(fetch_and_publish_station_data(station, sem)) 
        for station in batch
    ]
    
    await asyncio.gather(*tasks)
    elapsed = record_batch_duration(batch_index, start_time)
    logging.info(f"--- Fin du traitement du batch {batch_index + 1} ---")

def check_latest_lock_status(timeout=10):
    """
    Read the last message from the STATUS_TOPIC topic and return its content (dictionary) or None.
    """
    try:
        consumer = KafkaConsumer(
            bootstrap_servers=KAFKA_BROKER,
            auto_offset_reset="earliest",
            enable_auto_commit=False,
            consumer_timeout_ms=timeout * 1000,
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        tp = TopicPartition(STATUS_TOPIC, 0)
        consumer.assign([tp])
        end_offset = consumer.end_offsets([tp])[tp]
        if end_offset == 0:
            logging.info("Aucun message dans le topic %s.", STATUS_TOPIC)
            consumer.close()
            return None
        consumer.seek(tp, end_offset - 1)
        records = consumer.poll(timeout_ms=5000)
        consumer.close()
        if not records:
            logging.info("Aucun message récupéré lors du poll sur %s.", STATUS_TOPIC)
            return None
        last_msg = list(records.values())[0][0]
        logging.info("Dernier message dans '%s': %s", STATUS_TOPIC, last_msg.value)
        return last_msg.value
    except Exception as e:
        logging.error("Erreur lors de la lecture du dernier message: %s", e)
        return None

def wait_until_lock_free(poll_interval=5):
    """
    Lock status observer:
    Wait indefinitely until the last message from the STATUS_TOPIC topic indicates "free". 
    """
    while True:
        status_msg = check_latest_lock_status(timeout=5)
        if status_msg and status_msg.get("status", "").lower() == "free":
            api_status.set(1)  # API is UP
            logging.info("Le verrou est 'free'.")
            return True
        current = status_msg.get("status") if status_msg else "aucun"
        api_status.set(0)  # API is waiting
        logging.info("Verrou occupé ('%s'), attente de %s secondes...", current, poll_interval)
        time.sleep(poll_interval)

# -------------------------------------------------------------------
# MAIN de Observer (boucle infinie)
# -------------------------------------------------------------------
def main():
    api_status.set(1)  # API is UP
    while True:
        OBS_CYCLE_RUNS.inc() # Increment the observation cycle metric
        OBS_STATIONS_PROCESSED.set(0) # Reset the stations processed metric

        # Start cycle
        start_cycle = time.time()
        logging.info("=== Nouvelle tentative de traitement (Observer) ===")
        # Wait till the lock is free
        wait_until_lock_free(poll_interval=5)
        
        try:
            with open(BATCH_FILE, "r", encoding="utf-8") as f:
                batches = json.load(f)
        except Exception as e:
            logging.error("Erreur lors du chargement du fichier JSON: %s", e)
            time.sleep(10)
            continue

        if not batches:
            logging.error("Aucun batch trouvé dans le fichier JSON.")
            time.sleep(10)
            continue

        logging.info("Observation : Démarrage du traitement pour %d batches.", len(batches))
        batch_index = 0
        while batch_index < len(batches):
            # Verify lock is free before processing the next batch
            if not wait_until_lock_free(poll_interval=5):
                logging.error("Le verrou n'est plus free, abandon du cycle en cours.")
                break
            asyncio.run(process_batch(batches[batch_index], batch_index))
            batch_index += 1
            if batch_index < len(batches):
                logging.info("Observation : Pause de 60 secondes avant le prochain batch.")
                asyncio.run(asyncio.sleep(60))
        logging.info("Observation : Fin du traitement de tous les batches.")
        
        # End cycle
        elapsed = time.time() - start_cycle
        OBS_CYCLE_DURATION.observe(elapsed)
        logging.info("Observation : Attente de 30 secondes avant de redémarrer un nouveau cycle.")
        time.sleep(30)

if __name__ == "__main__":
    main()
