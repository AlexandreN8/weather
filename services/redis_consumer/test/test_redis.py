import unittest
from unittest.mock import patch, MagicMock
import json 
import redis_consumer

#Class définie pour nos tests
class TestRedisConsumer(unittest.TestCase):

    @patch('redis_consumer.logging')
    def test_process_real_time_data_valid(self, mock_logging):
        """
        Teste que process_real_time_data stocke correctement les données dans Redis
        lorsqu'on lui passe des données valides.
        """
        mock_redis_client = MagicMock()

        data = {
            "station_id": "123",
            "validity_time": "2025-03-19T14:00:00Z",
            "temperature": 20
        }

        # Appel de la fonction à tester
        redis_consumer.process_real_time_data(mock_redis_client, data)

        # Vérifie que hset a bien été appelé avec la bonne clé et la bonne valeur
        mock_redis_client.hset.assert_called_once_with(
            "station:real-time:123",
            "2025-03-19T14:00:00Z",
            json.dumps(data)
        )
        # Vérifie que le TTL a été défini à 3600 secondes donc une heure
        mock_redis_client.expire.assert_called_once_with("station:real-time:123", 3600)
        # Vérifie la publication sur le canal "data_updates"
        mock_redis_client.publish.assert_called_once_with("data_updates", json.dumps(data))

    @patch('redis_consumer.logging')
    def test_process_real_time_data_missing_fields(self, mock_logging):
        """
        Teste que process_real_time_data gère le cas où station_id ou validity_time est manquant.
        """
        mock_redis_client = MagicMock()
        data = {
            # "station_id": "123",   # Manquant pour simuler l'erreur
            "validity_time": "2025-03-19T14:00:00Z",
            "temperature": 20
        }

        redis_consumer.process_real_time_data(mock_redis_client, data)

        # Vérifie que hset n'est pas appelé
        mock_redis_client.hset.assert_not_called()
        # Vérifie qu'un avertissement (WARNING) est logué
        mock_logging.warning.assert_called_once()

    @patch('redis_consumer.logging')
    def test_process_alert_data_valid(self, mock_logging):
        """
        Teste que process_alert_data stocke correctement une alerte dans Redis
        lorsqu'on lui passe des données valides.
        """
        mock_redis_client = MagicMock()
        data = {
            "alert_key": "ALERT-123",
            "message": "Pluie abondante"
        }

        redis_consumer.process_alert_data(mock_redis_client, data)

        # Vérifie l'appel à set() avec un TTL de 24h (86400s)
        mock_redis_client.set.assert_called_once_with(
            "alert:ALERT-123",
            json.dumps(data),
            ex=86400
        )

    @patch('redis_consumer.logging')
    def test_process_alert_data_missing_key(self, mock_logging):
        """
        Teste que process_alert_data gère le cas où alert_key est manquant.
        """
        mock_redis_client = MagicMock()
        data = {
            "message": "Pluie abondante"
        }

        redis_consumer.process_alert_data(mock_redis_client, data)

        # Vérifie que set() n'est pas appelé
        mock_redis_client.set.assert_not_called()
        # Vérifie qu'un avertissement (WARNING) est logué
        mock_logging.warning.assert_called_once()

    @patch('redis_consumer.process_real_time_data')
    @patch('redis_consumer.process_alert_data')
    @patch('redis_consumer.logging')
    def test_process_message(self, mock_logging, mock_alert_data, mock_real_time_data):
        """
        Teste la logique de dispatch en fonction du topic Kafka (weather-real-time / weather-alerts).
        """
        mock_redis_client = MagicMock()

        # Simule un message Kafka
        class FakeKafkaMessage:
            def __init__(self, value):
                self.value = value

        # Cas 1: topic weather-real-time
        message_real_time = FakeKafkaMessage(json.dumps({"station_id": "123", "validity_time": "2025-03-19T14:00:00Z"}))
        redis_consumer.process_message(mock_redis_client, "weather-real-time", message_real_time)
        #Vérifie que real_time_data est bien appelé une fois
        mock_real_time_data.assert_called_once()
        #Vérifie que alert_data n'est pas appelé dans ce cas 
        mock_alert_data.assert_not_called()

        # Réinistialise les appels mock
        mock_real_time_data.reset_mock()
        mock_alert_data.reset_mock()

        # Cas 2: topic weather-alerts
        message_alerts = FakeKafkaMessage(json.dumps({"alert_key": "ALERT-123"}))
        redis_consumer.process_message(mock_redis_client, "weather-alerts", message_alerts)
        mock_alert_data.assert_called_once()
        mock_real_time_data.assert_not_called()

        # Réinistialise les appels mock
        mock_real_time_data.reset_mock()
        mock_alert_data.reset_mock()

        # Cas 3: topic inconnu
        #Vérifie que aucune fonction n'est appelé étant donné que le topic n'est ni une alerte ni une météo en temps réel
        message_unknown = FakeKafkaMessage(json.dumps({"some_key": "some_value"}))
        redis_consumer.process_message(mock_redis_client, "unknown-topic", message_unknown)
        mock_real_time_data.assert_not_called()
        mock_alert_data.assert_not_called()
        mock_logging.warning.assert_called_once()

if __name__ == '__main__':
    unittest.main()
