// routes/stationRoutes.js
const express = require('express');
const Station = require('../model/stationModel');
const Alert = require('../model/alertModel');

const router = express.Router();

// route pour récupérer une station par son identifiant
router.get('/:stationId', async (req, res) => {
    try {
      const station = await Station.findOne({ station_id: req.params.stationId });
      if (!station) {
        return res.status(404).json({ error: 'Station non trouvée pour cet identifiant' });
      }
      res.json(station);
    } catch (error) {
      console.error('Erreur lors de la récupération de la station:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la récupération de la station' });
    }
  });

// route pour récupérer toutes les alertes
router.get('/alerts', async (req, res) => {
    try {
      const alerts = await Alert.find({});
      res.json(alerts);
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la récupération des alertes' });
    }
});

// route pour récupérer toutes les stations
router.get('/', async (req, res) => {
  try {
    const stations = await Station.find({});
    res.json(stations);
  } catch (error) {
    console.error('Erreur lors de la récupération des stations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stations' });
  }
});

module.exports = router;
