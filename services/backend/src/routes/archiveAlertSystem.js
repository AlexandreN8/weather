const express = require('express');
const router = express.Router();
const Alert = require('../model/Alert'); // Collection active alerts
const ArchivedAlert = require('../model/ArchivedAlertSystem'); // Collection archived alerts

router.post('/', async (req, res) => {
  const { key } = req.body; // Alerts key
  try {
    // Check if the alert exist and is resolved
    const alert = await Alert.findOne({ key });
    if (!alert) {
      return res.status(404).json({ message: "Alerte non trouvée" });
    }
    if (alert.status !== 'resolved' && alert.status !== 'a_verifier') {
      return res.status(400).json({ message: "L'alerte n'est pas résolue et ne peut pas être archivée" });
    }
    // Convert the alert document to a plain object
    const alertObj = alert.toObject();
    delete alertObj._id; // Remove the _id field to avoid duplication (error)
    alertObj.status = "archived";

    // Create or update a new document in the archived collection
    const archivedAlert = await ArchivedAlert.findOneAndUpdate(
      { key },
      alertObj,
      { upsert: true, new: true }
    );
    // Remove the alert from the active collection
    await Alert.deleteOne({ key });
    res.status(200).json(archivedAlert);
  } catch (err) {
    console.error("Erreur lors de l'archivage de l'alerte :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
