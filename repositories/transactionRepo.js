const Transaction = require('../models/transaction');
const {methodCodes} = require('../models/methodCodes')

class TransactionRepo {
    constructor(){}

    async saveTransaction(transaction) {
        const createdTransaction = await transaction.save();
        return createdTransaction;
    }

    async findTransactionById(_id) {
        const transaction = await Transaction.findById(_id);
        return transaction;
    }

    async deleteTransaction(_id) {
        await Transaction.findByIdAndRemove(_id);
        return true;
    }


}



module.exports = TransactionRepo