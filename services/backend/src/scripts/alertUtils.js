// Create a custom unique key for an alert
const getAlertKey = (alert) => {
  const alertName = alert.labels?.alertname || "unknown";
  const container = alert.labels?.container || alert.labels?.id || alert.labels?.name || "unknown";
  return `${alertName}_${container}`;
};

module.exports = { getAlertKey };
