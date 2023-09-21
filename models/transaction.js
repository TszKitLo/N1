const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {methodCodes} = require('./methodCodes')

const transactionStatus = ['Pending', 'Posted'];
const transactionSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: transactionStatus
    },
    counterpartyName: {
        type: String
    },
    methodCode: {
        type: String,
        required: true
    },
    note: {
        type: String
    }
  
});

module.exports = mongoose.model('Transaction', transactionSchema);