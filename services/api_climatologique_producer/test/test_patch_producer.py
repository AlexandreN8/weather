import pytest
from unittest.mock import patch, MagicMock

# Patch "producer.KafkaProducer" avant tout
with patch("kafka.KafkaProducer") as MockProducer:
    MockProducer.return_value = MagicMock()

    # On importe le fichier test
    from producer_tests import *