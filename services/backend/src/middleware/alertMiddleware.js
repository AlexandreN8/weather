const Alert = require('../model/Alert');
const { getAlertKey } = require('../scripts/alertUtils');
const { getIo } = require('../config/socket');

const activeAlerts = new Map();

const processAlert = async (payload) => {
  console.log("Payload reçu :", JSON.stringify(payload, null, 2));
  // Payload can be an array of alerts or a single alert
  const alerts = Array.isArray(payload.alerts) ? payload.alerts : [payload];
  const now = new Date();

  for (const alert of alerts) {
    const key = getAlertKey(alert);
    
    // Determine the status of the alert
    let incomingStatus = 'active';
    // Grafana resolved takes precedence over backend resolved
    if (alert.status && alert.status.toLowerCase() === 'resolved') {
      incomingStatus = 'resolved';
    }

    if (activeAlerts.has(key)) {
      let existingAlert = activeAlerts.get(key);
      
      // Update the status of the alert according to the incoming status
      if (incomingStatus === 'resolved') {
        existingAlert.status = 'resolved';
      } else if (existingAlert.status === 'resolved') {
        // Handle the case where the alert was resolved but a new firing is received
        existingAlert.status = 'active';
        console.log(`Réactivation de l'alerte : ${key}`);
      } else {
        existingAlert.status = 'active';
      }
      
      existingAlert.lastUpdated = now;
      activeAlerts.set(key, existingAlert);
      
      await Alert.findOneAndUpdate(
        { key },
        { lastUpdated: now, status: existingAlert.status },
        { new: true }
      );
      
      getIo().emit('alertUpdate', existingAlert);
    } else {
      // New alert
      const newAlert = {
        ...alert,
        key,
        firstReceived: now,
        lastUpdated: now,
        status: incomingStatus
      };

      activeAlerts.set(key, newAlert);

      const alertCreated = await Alert.findOneAndUpdate(
        { key },
        newAlert,
        { upsert: true, new: true }
      );

      getIo().emit('alert', alertCreated);
    }
  }
};

// Define thresholds for alert status transitions
const aVerifierThresholdMs = 2 * 60 * 1000;  // 2min for "a_verifier"
const resolvedThresholdMs = 5 * 60 * 1000;     // 5min w/o signal from grafana mean it's "resolved"

setInterval(async () => {
  const now = new Date();

  for (const [key, alert] of activeAlerts.entries()) {
    // If the alert is active, check if it should be marked as resolved
    const elapsed = now - alert.lastUpdated;
    if (alert.status === 'active') {
      if (elapsed > resolvedThresholdMs) {
        // More than 5 minutes without signal from Grafana, mark as resolved
        alert.status = 'resolved';
        getIo().emit('alertUpdate', alert);
        await Alert.findOneAndUpdate({ key }, { status: 'resolved' }, { new: true });
        console.log(`Alerte ${key} marquée comme "resolved" par inactivité prolongée.`);
      } else if (elapsed > aVerifierThresholdMs && alert.status !== 'a_verifier') {
        // Between 2 and 5 minutes it should be marked as "a_verifier"
        alert.status = 'a_verifier';
        getIo().emit('alertUpdate', alert);
        await Alert.findOneAndUpdate({ key }, { status: 'a_verifier' }, { new: true });
        console.log(`Alerte ${key} passée à "a_verifier".`);
      }
    }
  }
}, 30000);

module.exports = { processAlert };
