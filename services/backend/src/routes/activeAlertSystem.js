const express = require('express');
const router = express.Router();
const Alert = require('../model/Alert');

// Fetch all alerts except "archived" ones
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find({ status: { $in: ["active", "resolved", "a_verifier"] } });
    res.status(200).json(alerts);
  } catch (err) {
    console.error("Erreur lors de la récupération des alertes :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
