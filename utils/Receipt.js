const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
    date: String,
    subject: String,
    category: String,
    total: String,
    filename: String,
    userId: mongoose.Schema.Types.ObjectId  // assuming you want to link receipts to a specific user
}, { timestamps: true });

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
