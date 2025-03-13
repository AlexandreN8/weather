import pymongo
from pymongo import MongoClient
from datetime import datetime
import os
import logging
import time


# Configuration MongoDB
MONGO_USER = os.getenv("MONGO_INITDB_ROOT_USERNAME")
MONGO_PASS = os.getenv("MONGO_INITDB_ROOT_PASSWORD")
MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASS}@ter_mongodb:27017/"

DB_NAME = "weatherDB"
COLLECTION_NAME = "weatherData"


def connect_to_mongo():
    retries = 5
    while retries > 0:
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            print(client.server_info()) 
            logging.info("Connexion à MongoDB réussie")
            return client
        except Exception as e:
            logging.warning(f"Échec de connexion à MongoDB ({retries} essais restants)... {e}")
            time.sleep(5)
            retries -= 1
    logging.error("Impossible de se connecter à MongoDB. Vérifie si le service est bien démarré.")
    exit(1)


client = connect_to_mongo()
db = client[DB_NAME]
collection = db[COLLECTION_NAME]
archive_collection = db["archiveData"]
def archive_documents():
    print("Archivage des documents expirés...")
    now = datetime.utcnow()
    
    # Récupérer les documents sur le point d'expirer
    documents = list(source_collection.find({"created_at": {"$lt": now}}))
    if documents:
        # Insérer dans la collection d'archive
        archive_collection.insert_many(documents)

        # Supprimer les documents archivés de la collection principale
        source_collection.delete_many({"created_at": {"$lt": now}})

        print(f"{len(documents)} documents archivés avec succès.")

if __name__ == "__main__":
    archive_documents()
    
