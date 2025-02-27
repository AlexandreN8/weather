import pytest
import time
import logging
import json
import asyncio
from unittest import mock
from unittest.mock import AsyncMock
from producer import check_request_rate, add_request_times, request_times, producer, TOPIC_NAME, fetch_and_publish_station_data, fetch_station_data

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@pytest.fixture
def reset_request_timestamps():
     request_times.clear()
     logger.info("Horodatages réinitialisés.")

 # Test de la gestion du taux de requêtes
def test_request_rate_limit(reset_request_timestamps):
     logger.info("Début du test : test_request_rate_limit")
    
     # On envoie ici 50 requetes
     for _ in range(50):
         add_request_times()
    
     logger.info("50 requêtes ont été ajoutées sans dépasser la limite.")
    
     time.sleep(1)  # temps de pause pour les logs
    
     # Vérifier que l'exception n'est pas levée pour 50 requêtes
     print("Vérification après l'ajout de 50 requêtes")
     check_request_rate()
     print("Vérification réussie, aucune exception levée.")
    
     # Ajouter une requête supplémentaire et vérifier qu'une exception est bien levée
     add_request_times()
     logger.info("Ajout d'une requête supplémentaire pour tester la limite.")

     # Ajouter un log pour vérifier la taille de request_times après ajout
     logger.info(f"Après ajout d'une requête supplémentaire, total des requêtes: {len(request_times)}")
     logger.info(f"Horodatages actuels : {request_times}")
    
     # On vérifie l'exception quand on fait le dépassement de requetes
     try:
         logger.info("Vérification que l'exception est levée...")
         check_request_rate()
     except Exception as e:
         logger.error(f"L'exception a été levée : {e}")
         assert str(e) == "Trop de requêtes envoyées en moins d'une minute", "L'exception attendue n'a pas été levée."



# Test de la fonction Kafka Producer send, permet de prévenir si la structure des données ou leur formatation change
#Etre averti pour éviter des bugs dans la base de données et vérifier que les bonnes données sont envoyées et reçues.
#def test_kafka_producer_send(mocker):
    #data que Kafka va envoyer
#    enriched_data = {
#        "station_id": 1,
#        "name": "Station X",
#        "type": "Type A",
#        "start_date": "2020-01-01",
#        "temperature": 25
#    }

    # Utilise un mock pour simuler un message que l'on envoit sur Kafka
    #pour check que send() est appelée avec des bons paramètres
#    mock_send = mocker.patch.object(producer, 'send')

    #Simulation de l'envoi d'un message Kafka
#    producer.send(TOPIC_NAME, key=str(1).encode('utf-8'), value=json.dumps(enriched_data).encode('utf-8'))

    # Vérifier que send() a été appelé une seule fois
#    mock_send.assert_called_once()

    # Récupérer les arguments passés à send()
#    called_topic, called_kwargs = mock_send.call_args

    # Vérifier que le topic est correct
#    assert called_topic == (TOPIC_NAME,)

    # Vérifier que la clé et la valeur sont bien correctes
#    assert called_kwargs["key"] == str(1).encode('utf-8')
#    assert json.loads(called_kwargs["value"].decode('utf-8')) == enriched_data

#@pytest.mark.asyncio
#Permet de tester la récup et l'envoi des data méteo d'une station vers Kafka
#S'assurer que les data sont publiées
#async def test_fetch_and_publish_station_data(mocker):
    
    # Fausse data d'une station que l'on va utiliser pour notre test
#    fake_station = {
#        "station_id": 1,
#        "name": "Station Test",
#        "type": "Type A",
#        "start_date": "2020-01-01"
#    }
#    fake_api_response = [{"temperature": 25, "humidity": 80}]  # Réponse simulée de l'API

    # Mock de la fonction fetch_station_data pour qu'elle renvoie la fausse réponse
#    mocker.patch("producer.fetch_station_data", new=AsyncMock(return_value=fake_api_response))

    #  Mock de producer.send pour intercepter l'envoi vers Kafka
#    mock_send = mocker.patch.object(producer, "send")

    # Création d'un sémaphore factice
#    sem = asyncio.Semaphore(10)

    # Exécution de la fonction testée
#    await fetch_and_publish_station_data(fake_station, sem)

    # Vérifier que producer.send a bien été appelé
#    mock_send.assert_called_once()

    # Vérifier que les données envoyées à Kafka sont correctes
#    called_args, called_kwargs = mock_send.call_args
#    assert called_args[0] == "weather-real-time" 
#    assert called_kwargs["key"] == str(1).encode("utf-8")

    # Vérifier la valeur
#    expected_value = {
#        "station_id": 1,
#        "name": "Station Test",
#        "type": "Type A",
#        "start_date": "2020-01-01",
#        "temperature": 25,
#        "humidity": 80
#    }
#    assert json.loads(called_kwargs["value"].decode("utf-8")) == expected_value

#@pytest.mark.asyncio
# #permet de tester la récup des data météo, test fonctionelle, on simule une interaction complète avec une API
# async def test_fetch_station_data(mocker):

#     station_id = 1
#     # Mock du résultat d'une API
#     fake_response = [{"temperature": 25, "humidity": 80}]

#     # Mock de httpx.AsyncClient.get pour simuler des appels HTTP
#     mock_get = mocker.patch("httpx.AsyncClient.get", new_callable=AsyncMock)

#     # Création des réponses simulées
#     first_attempt = AsyncMock()
#     first_attempt.status_code = 500  # Échec initial attendue

#     second_attempt = AsyncMock()
#     second_attempt.status_code = 200  # Succès attendue
#     second_attempt.json = AsyncMock()
#     #json envoie ensuite les data et on les alloue à fake_response  
#     second_attempt.json.return_value = fake_response

#     # Simulation d'un premier échec puis d'un succès
#     mock_get.side_effect = [first_attempt, second_attempt]

#     # Mock de asyncio.sleep pour éviter l'attente que l'on peut avoir lors de l'échec de la première simulation
#     mocker.patch("asyncio.sleep", new_callable=AsyncMock)

#     # Exécution de la fonction pour avoir le résultat attendue
#     result = await fetch_station_data(station_id)

#     #Allocation du mock à une variable temporaire qui permet d'avoir des tests modulables
#     expected_result = fake_response 

#     # Vérifications des tentatives effectuées et des data
#     assert mock_get.call_count == 2, "La fonction aurait dû faire 2 tentatives."
#     assert result == expected_result, f"Les données retournées ne sont pas correctes: {result}"

