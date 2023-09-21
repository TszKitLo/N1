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

    async findAllTransactions() {
        const transactions = await Transaction.find({});
        return transactions;
    }

    async findTransactionsByMethodName(methodName) {
        const transactions = await Transaction.find({methodCode: methodName});
        return transactions;
    }

    // Calculate the sum of the 'amount' field
    async sumOfAllTransactions(){
            
        const result = await Transaction.aggregate([
            {
                $group: {
                    _id: null, // Group all documents into a single group
                    totalAmount: { $sum: '$amount' }, // Calculate the sum of the 'amount' field
                },
            },
        ]);

        return (result.length > 0) ? result[0].totalAmount : 0;
    }
}



module.exports = TransactionRepo