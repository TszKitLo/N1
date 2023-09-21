const Transaction = require('../models/transaction');
const {methodCodes} = require('../models/methodCodes')

class TransactionRepo {
    constructor(){}

    async saveTransaction(transaction) {
        const createdTransaction = await transaction.save();
        return createdTransaction;
    }


}



module.exports = TransactionRepo