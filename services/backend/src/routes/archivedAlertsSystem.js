const express = require('express');
const router = express.Router();
const ArchivedAlert = require('../model/ArchivedAlertSystem'); 

// Fetch all archived alerts
router.get('/', async (req, res) => {
  try {
    const archivedAlerts = await ArchivedAlert.find({});
    res.status(200).json(archivedAlerts);
  } catch (err) {
    console.error("Erreur lors de la récupération des alertes archivées :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
