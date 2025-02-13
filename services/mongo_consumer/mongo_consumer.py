from kafka import KafkaConsumer
from pymongo import MongoClient
import time 
from urllib.parse import quote_plus
import json
import logging

# Configuration Kafka
KAFKA_BROKER = "ter_kafka:9092"  # Adresse de Kafka
TOPIC_NAME = "weather-verified"  # Topic à écouter

# Configuration MongoDB


username = quote_plus('admin')
password = quote_plus('password')
MONGO_URI = f"mongodb://{username}:{password}@ter_mongodb:27017/"

DB_NAME = "weatherDB"
COLLECTION_NAME = "weatherData"

# Logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def connect_to_mongo():
    retries = 5
    while retries > 0:
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            print(client.server_info())  # Vérifie si MongoDB est dispo
            logging.info("Connexion à MongoDB réussie")
            return client
        except Exception as e:
            logging.warning(f"Échec de connexion à MongoDB ({retries} essais restants)... {e}")
            time.sleep(5)
            retries -= 1
    logging.error("Impossible de se connecter à MongoDB. Vérifie si le service est bien démarré.")
    exit(1)

def main():
    client = connect_to_mongo()
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    # Connexion à Kafka
    consumer = KafkaConsumer(
        TOPIC_NAME,
        bootstrap_servers=KAFKA_BROKER,
        auto_offset_reset='earliest',
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    logging.info(f"En attente de messages sur Kafka topic '{TOPIC_NAME}'...")

    # Boucle infinie pour écouter Kafka et enregistrer dans MongoDB
    for message in consumer:
        data = message.value  # Récupérer les données du message
        logging.info(f"Nouveau message reçu : {data}")

        # Insérer dans MongoDB
        collection.insert_one(data)
        logging.info("Données insérées dans MongoDB")

if __name__ == "__main__":
    main()
