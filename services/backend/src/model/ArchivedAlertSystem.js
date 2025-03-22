const mongoose = require('mongoose');

const archivedAlertSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  status: { type: String, default: 'archived' },
  labels: { type: Object, required: true },
  annotations: { type: Object, required: true },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date },
  firstReceived: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
}, { collection: "alerts_system_closed" });

module.exports = mongoose.model('ArchivedAlert', archivedAlertSchema);
