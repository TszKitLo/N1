const Transaction = require('../models/transaction');
const TransactionRepo = require('../repositories/transactionRepo');
const {methodCodes} = require('../models/methodCodes')

class TransactionService {
    constructor(transactionRepo = new TransactionRepo()){
        this.transactionRepo = transactionRepo;
    }

    async createTransaction(date, amount, status, counterpartyName, methodCode, note) {
        var code;
        if(methodCode == null) {
            if(amount >= 0)
                code = methodCodes.Incoming;
            else
                code = methodCodes.Outgoing;
        } else {
            code = methodCodes[methodCode];
        }
        
        const transaction = new Transaction({
            date: new Date(date),
            amount: amount,
            status: status,
            counterpartyName: counterpartyName,
            methodCode: code,
            note: note

        });
        const createdTransaction = await this.transactionRepo.saveTransaction(transaction);

        return createdTransaction;

    }

    async updateTransaction(_id, amount, status, note) {
        const transaction = await this.transactionRepo.findTransactionById(_id);
        if (!transaction) {
          const error = new Error('No transaction found!');
          error.code = 404;
          throw error;
        }
    
        if(amount != null) transaction.amount = amount;
        if(status != null) transaction.status = status;
        if(note != null) transaction.note = note;
    
        const updatedTransaction = await this.transactionRepo.saveTransaction(transaction);

        return updatedTransaction;
    }

    async deleteTransaction(_id) {
        await this.transactionRepo.deleteTransaction(_id);
        return true;
    }

}



module.exports = TransactionService