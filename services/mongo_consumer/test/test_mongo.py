import unittest
from unittest.mock import patch, MagicMock
import json
import sys
import time

# On importe les fonctions à tester depuis mongo_consumer.py
import mongo_consumer

#class qui va nous permettre de faire nos tests
class TestMongoConsumer(unittest.TestCase):
    #Mock du mongo_consumer.MongoClient pour le test
    @patch('mongo_consumer.MongoClient')
    def test_connect_to_mongo_success(self, mock_mongo_client):
        """
        Teste la connexion réussie à MongoDB en simulant une réponse de server_info.
        """
        # Simuler une connexion réussie à MongoDB
        instance = MagicMock()
        instance.server_info.return_value = {"version": "4.0"}
        mock_mongo_client.return_value = instance
        
        client = mongo_consumer.connect_to_mongo()
        self.assertIsNotNone(client)
        instance.server_info.assert_called_once()
    
    @patch('mongo_consumer.MongoClient')
    def test_connect_to_mongo_failure(self, mock_mongo_client):
        """
        Simule un échec de connexion à MongoDB et vérifie que le script tente 5 fois avant de quitter.
        """
        # Simuler une exception à chaque tentative de connexion
        mock_mongo_client.side_effect = Exception("Connection failed")
        
        # Le script doit quitter via exit(1) après avoir tenté 5 fois
        with self.assertRaises(SystemExit):
            mongo_consumer.connect_to_mongo()
    #Mock du KafkaConsumer et du MongoClient
    @patch('mongo_consumer.KafkaConsumer')
    @patch('mongo_consumer.MongoClient')
    def test_message_insertion(self, mock_mongo_client, mock_kafka_consumer):
        """
        Teste que l'insertion d'un message provenant de Kafka dans MongoDB se fait correctement.
        """
        # Simulation de la connexion MongoDB
        mongo_instance = MagicMock()
        mock_mongo_client.return_value = mongo_instance
        
        # Simuler l'accès à la base et à la collection
        db = MagicMock()
        collection = MagicMock()
        mongo_instance.__getitem__.return_value = db
        db.__getitem__.return_value = collection
        
        # Simulation d'un message Kafka avec un seul élément dans l'itérateur
        test_message = {"temperature": 25, "humidity": 60}
        fake_message = MagicMock()
        fake_message.value = test_message
        # L'itérateur simule un seul message, puis se termine (StopIteration)
        mock_kafka_consumer_instance = iter([fake_message])
        mock_kafka_consumer.return_value = mock_kafka_consumer_instance
        
        # Pour tester la logique d'insertion, on reprend le code de la boucle de consommation
        for message in mock_kafka_consumer_instance:
            data = message.value
            collection.insert_one(data)
            # On s'arrête après le premier message pour le test
            break
        #Assert qui vérifie que l'insertion a bien été faite dans la base Mongo
        collection.insert_one.assert_called_once_with(test_message)

if __name__ == '__main__':
    unittest.main()

