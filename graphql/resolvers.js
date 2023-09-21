const TransactionService = require('../services/transactionService');
const { methodCodes, methodCodesDTO } = require('../models/methodCodes');

const transactionService = new TransactionService();

module.exports = {
  // Create transaction
  createTransaction: async function({transactionInputData}) {
    const createdTransaction = transactionService.createTransaction(
      transactionInputData.date, 
      transactionInputData.amount, 
      transactionInputData.status, 
      transactionInputData.counterpartyName, 
      transactionInputData.methodCode, 
      transactionInputData.note
    );
    return createdTransaction;
  }
};
