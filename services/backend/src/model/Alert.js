const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  key: { type: String, unique: true }, 
  status: { type: String, default: 'active' }, // active, resolved, a_verifier
  labels: { type: Object, required: true }, // labels: severity, category etc...
  annotations: { type: Object, required: true }, // annotations: description, summary
  startsAt: { type: Date, required: true }, 
  endsAt: { type: Date },
  firstReceived: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
},{ collection: 'alerts_system_inprogress' });

module.exports = mongoose.model('Alert', alertSchema);
