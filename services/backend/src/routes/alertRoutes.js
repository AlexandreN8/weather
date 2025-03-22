const express = require('express');
const router = express.Router();
const alertService = require('../middleware/alertMiddleware');

// Fetch grafana alerts
router.post('/', async (req, res) => {
  try {
    await alertService.processAlert(req.body);
    res.status(200).send('Alerte reçue');
  } catch (err) {
    console.error('Erreur lors du traitement de l\'alerte:', err);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;