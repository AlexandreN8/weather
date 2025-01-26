import asyncio
import httpx
import json
import logging
import yaml
from kafka import KafkaProducer
import os

# Collect almost real-time weather data from the observation API and publish it to Kafka
# API constraint : 50 requests per minute
# Number of stations : 2150 / 50 = 43 batches => ~45 minutes
# ~45 minutes before next refresh
# Request are shared between Meteo France APIs
# Need to wait while we retrieve api climatology data history

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

# Kafka Producer
producer = KafkaProducer(
    bootstrap_servers=KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    key_serializer=lambda k: str(k).encode('utf-8')
)


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
                response = await client.get(f"{API_URL}/station/infrahoraire-6m", headers=headers, params=params)

                if response.status_code == 200:
                    return response.json()

                elif response.status_code in {429, 500, 503}:
                    logging.warning(f"Requête échouée pour la station {station_id} (tentative {attempt}/{retries}). "
                                    f"Réponse : {response.status_code}")
                    await asyncio.sleep(2 ** attempt)

            except httpx.RequestError as exc:
                logging.error(f"Erreur réseau pour la station {station_id}: {exc}")
                await asyncio.sleep(2 ** attempt)

    logging.error(f"Échec final pour la station {station_id} après {retries} tentatives.")
    return None

async def fetch_and_publish_station_data(station, sem):
    """ Co-routine to fetch and publish weather data for a specific station. """
    async with sem:
        station_id = station["station_id"]
        await asyncio.sleep(1.2)
        raw_data = await fetch_station_data(station_id)
        if raw_data:
            # Verify if the data is a list
            if isinstance(raw_data, list):
                # Enrich each data point with station metadata
                for data_point in raw_data:
                    enriched_data = {
                        "station_id": station_id,
                        "name": station.get("name"),
                        "type": station.get("type"),
                        "start_date": station.get("start_date"),
                        **data_point,  # Merge the data point with the station metadata
                    }
                    #  Publish the enriched data to Kafka
                    producer.send(TOPIC_NAME, key=station_id, value=enriched_data)
                    logging.info(f"Données publiées pour la station {station_id}: {json.dumps(enriched_data, indent=2)}")
            else:
                logging.error(f"Format inattendu des données pour la station {station_id}: {type(raw_data)}")

async def process_batch(batch, batch_index):
    """  Co-routine to process a batch of stations concurrently. """
    logging.info(f"--- Début du traitement du batch {batch_index + 1} ---")
    sem = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

    tasks = [
        asyncio.create_task(fetch_and_publish_station_data(station, sem))
        for station in batch
    ]

    await asyncio.gather(*tasks)
    logging.info(f"--- Fin du traitement du batch {batch_index + 1} ---")

# -------------------------------------------------------------------
# MAIN
# -------------------------------------------------------------------

def main():
    # Load the batches from the JSON file
    with open(BATCH_FILE, "r", encoding="utf-8") as f:
        batches = json.load(f)

    if not batches:
        logging.error("Aucun batch trouvé dans le fichier JSON.")
        return

    logging.info(f"Lancement de la récupération pour {len(batches)} batches.")

    # Process each batch sequentially
    for i, batch in enumerate(batches):
        asyncio.run(process_batch(batch, i))
        if i < len(batches) - 1:
            logging.info(f"Pause de 60 secondes avant le batch {i + 2}.")
            asyncio.run(asyncio.sleep(60))

    logging.info("Traitement de tous les batches terminé.")
    producer.close()

if __name__ == "__main__":
    main()
