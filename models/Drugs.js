const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DrugSchema = new Schema({
    drugID: {type: String},
    image: {type: String},
    name: {type: String},
    pharmacy: {type: String},
    batchNo: {type: String},
    nafdacNo: {type: String},
    productionDate: {type: String},
    expiryDate: {type: String},
    authPin: { type: String, uppercase: true },
    time: { type: Number }
});

module.exports = mongoose.model('drugs', DrugSchema);