import pytest
import asyncio
import json
import logging
from unittest.mock import patch, AsyncMock, MagicMock
from datetime import datetime

import producer 

#Aide pour les tests des fonctions asynchrones
class FakeAsyncClient:
    """
    Classe pour simuler un client HTTP asynchrone et renvoyer une réponse factice.
    """
    def __init__(self, fake_get):
        self.fake_get = fake_get

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

    async def get(self, url, headers=None, params=None):
        return await self.fake_get(url, headers=headers, params=params)

@pytest.mark.asyncio
#Test de create_command_for_station
async def test_create_command_for_station_success(monkeypatch):
    station_id = "station_test"
    start_date = "2025-01-01T00:00:00Z"
    end_date   = "2025-01-01T05:59:59Z"

    #Création d'une réponse simulée
    fake_response = MagicMock() #On utilise MagicMock() qui permet de simuler la réponse HTTP renvoyée par l'API
    fake_response.status_code = 202 #Code pour un succès
    fake_response.json.return_value = {
        "elaboreProduitAvecDemandeResponse": {"return": "cmd_123"}
    }

    async def fake_get(url, headers=None, params=None):
        return fake_response

    # On remplace httpx.AsyncClient par notre FakeAsyncClient
    monkeypatch.setattr("httpx.AsyncClient", lambda timeout: FakeAsyncClient(fake_get))

    # On remplace asyncio.sleep pour éviter d'attendre réellement
    with patch("asyncio.sleep", new=AsyncMock()):
        cmd_id, ok = await producer.create_command_for_station(station_id, start_date, end_date)
        assert ok is True
        assert cmd_id == "cmd_123"


@pytest.mark.asyncio
#Test de process_batch
async def test_process_batch(monkeypatch):
    """
    Teste l'enchaînement global : 
    - Création de commande
    - Récupération du fichier
    - Publication sur Kafka
    """
    # Batch factice avec une seule station
    batch = [{"station_id": "station_test"}]
    start_date = "2025-01-01T00:00:00Z"
    end_date   = "2025-01-01T05:59:59Z"

    #Patch create_command_for_station => renvoie (cmd_123, True)
    async def fake_create_command(station_id, s, e):
        return ("cmd_123", True)
    monkeypatch.setattr("producer.create_command_for_station", fake_create_command)

    # Patch fetch_file_for_station => renvoie un CSV converti
    async def fake_fetch_file(cmd_id):
        return ([{"val": 123}], "done")
    monkeypatch.setattr("producer.fetch_file_for_station", fake_fetch_file)

    # Patch producer.send pour capturer les messages envoyés
    sent_messages = []
    def fake_send(topic, key=None, value=None):
        if not isinstance(key, bytes):
            key = str(key).encode("utf-8")
        if not isinstance(value,bytes):
            value = json.dumps(value).encode("utf-8")
        sent_messages.append((topic, key, value))
    producer.producer = MagicMock()
    monkeypatch.setattr(producer.producer,"send", fake_send)

    # Appel de process_batch
    await producer.process_batch(batch, start_date, end_date, 0)

    # Vérifier qu'on a bien envoyé un message Kafka
    assert len(sent_messages) == 1
    topic, key, val_bytes = sent_messages[0]
    assert topic == producer.TOPIC_NAME
    assert key == b"station_test"

    val_json = json.loads(val_bytes.decode("utf-8"))
    assert val_json["station_id"] == "station_test"
    assert val_json["rows"] == [{"val": 123}]
    
def test_notify_observation_busy(monkeypatch):
    """
    Teste que notify_observation_busy() envoie bien un message 'busy' sur Kafka.
    """
    sent_messages = []
    def fake_send(topic, key=None, value=None):
        if not isinstance(key, bytes):
            key = str(key).encode("utf-8")
        if not isinstance(value,bytes):
            value = json.dumps(value).encode("utf-8")
        sent_messages.append((topic, key, value))
    producer.producer = MagicMock()

    monkeypatch.setattr(producer.producer, "send", fake_send)
    producer.notify_observation_busy()

    assert len(sent_messages) == 1
    topic, key, val_bytes = sent_messages[0]
    assert topic == producer.STATUS_TOPIC
    val_json = json.loads(val_bytes.decode("utf-8"))
    assert val_json["status"] == "busy"
    assert "timestamp" in val_json

def test_notify_observation_resume(monkeypatch):
    """
    Teste que notify_observation_resume() envoie bien un message 'free' sur Kafka.
    """
    sent_messages = []
    def fake_send(topic, key=None, value=None):
        if not isinstance(key, bytes):
            key = str(key).encode("utf-8")
        if not isinstance(value,bytes):
            value = json.dumps(value).encode("utf-8")
        sent_messages.append((topic, key, value))
    producer.producer = MagicMock()

    monkeypatch.setattr(producer.producer, "send", fake_send)
    producer.notify_observation_resume()

    assert len(sent_messages) == 1
    topic, key, val_bytes = sent_messages[0]
    assert topic == producer.STATUS_TOPIC
    val_json = json.loads(val_bytes.decode("utf-8"))
    assert val_json["status"] == "free"
    assert "timestamp" in val_json