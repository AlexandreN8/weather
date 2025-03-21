from pymongo import MongoClient
from elasticsearch import Elasticsearch
import json

# Connexion à MongoDB
MONGO_URI = "mongodb://mongodb:27017/"
mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client["weatherDB"]
mongo_collection = mongo_db["weatherData"]


ELASTICSEARCH_URI = "http://elasticsearch:9200"
es = Elasticsearch(ELASTICSEARCH_URI, basic_auth=("elastic", "changeme"))

# Fonction d'indexation des données
def index_mongo_data():
    for doc in mongo_collection.find():
        doc["_id"] = str(doc["_id"])  
        es.index(index="weather_data", document=doc)
    print(" Données indexées dans Elasticsearch.")

if __name__ == "__main__":
    index_mongo_data()
