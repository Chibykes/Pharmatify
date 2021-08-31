const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AlertSchema = new Schema({
    alertID: {type: String},
    drugID: {type: String},
    name: {type: String},
    expiryDate: {type: String},
    msg: {type: String},
    timeLeft: { type: String },
    time: { type: Number }
});

module.exports = mongoose.model('alerts', AlertSchema);