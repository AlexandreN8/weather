const mongoose = require('mongoose');

const stationHistorySchema = new mongoose.Schema({
station_id: { type: String, required: true },
  name: String,
  type: String,
  start_date: Date,
  lat: Number,
  lon: Number,
  geo_id_insee: String,
  reference_time: Date,
  insert_time: Date,
  validity_time: Date,
  t: Number,
  td: Number,
  u: Number,
  dd: Number,
  ff: Number,
  dxi10: Number,
  fxi10: Number,
  rr_per: Number
}, { timestamps: true, collection: 'stationHistories' });

module.exports = mongoose.models.StationHistory || mongoose.model('StationHistory', stationHistorySchema);