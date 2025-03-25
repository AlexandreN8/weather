const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    station_id: { type: String, required: true, unique: true },
    name: String,
    type: String,
    start_data: Date,
    let: Number,
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
}, { timestamps: true, collection: 'stations' });

module.exports = mongoose.models.Station || mongoose.model('Station', stationSchema);