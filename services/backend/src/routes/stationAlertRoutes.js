// routes/stationRoutes.js
const express = require('express');
const Station = require('../model/stationModel');
const Alert = require('../model/alertModel');
const StationHistory = require('../model/stationHistoryModel');

const router = express.Router();

// route pour récupérer lh'istorique d'une station sur 24h
router.get('/history/24h/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const history = await StationHistory.find({
      station_id: stationId,
      reference_time: { $gte: twentyFourHoursAgo }
    }).sort({ reference_time: 1 });
    if (!history || history.length === 0) {
      return res.status(404).json({ error: 'Aucune donnée historique trouvée pour ces 24 heures' });
    }
    res.json(history);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique sur 24h:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération de l'historique" });
  }
});

// route pour récupérer l'historique d'une station sur une journée donnée (format YYYY-MM-DD)
router.get('/history/day/:stationId/:date', async (req, res) => {
  try {
    const { stationId, date } = req.params;
    const startOfDay = new Date(date + 'T00:00:00Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    const history = await StationHistory.find({
      station_id: stationId,
      reference_time: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ reference_time: 1 });
    if (!history || history.length === 0) {
      return res.status(404).json({ error: 'Aucune donnée historique trouvée pour cette date' });
    }
    res.json(history);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique pour la date donnée:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération de l'historique" });
  }
});

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

// route pour récupérer les stations d'une même ville par code postal
router.get('/postal/:code', async (req, res) => {
  try {
    const codePostal = req.params.code;
    // On utilise une expression régulière pour trouver les station_id qui commencent par le code postal
    const stations = await Station.find({
      station_id: { $regex: `^${codePostal}` }
    });
    if (!stations || stations.length === 0) {
      return res.status(404).json({ error: 'Aucune station trouvée pour ce code postal' });
    }
    res.json(stations);
  } catch (error) {
    console.error('Erreur lors de la récupération des stations par code postal:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des stations' });
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
