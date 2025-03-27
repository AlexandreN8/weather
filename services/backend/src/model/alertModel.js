const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    domain_name: String,
    title: String,
    risk_name: String,
    risk_color: String,
    risk_level: Number,
    hazard_name: String,
    start_time: Date,
    end_time: Date,
    description: String,
    alert_key: { type: String, required: true, unique: true }
}, { timestamps: true, collection: 'alerts' });

module.exports = mongoose.models.Alert || mongoose.model('Alert', alertSchema);