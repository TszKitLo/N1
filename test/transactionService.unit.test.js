const TransactionService = require("../services/transactionService");
const TransactionRepo = require("../repositories/transactionRepo");
const { methodCodes } = require("../models/methodCodes");
const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;

describe("TransactionService", () => {
  let transactionService;
  let transactionRepoMock;

  beforeEach(() => {
    // Create a mock for TransactionRepo
    transactionRepoMock = sinon.createStubInstance(TransactionRepo);
    transactionService = new TransactionService(transactionRepoMock);
  });

  describe("createTransaction", () => {
    it("should create a transaction", async () => {
      // Arrange
      const mockTransactionData = {
        date: "2023-09-18T10:00:00",
        amount: 1000,
        status: "Pending",
        counterpartyName: "John Doe",
        methodCode: 34,
        note: "Test transaction",
      };

      const mockSavedTransaction = {
        _id: "123456",
        ...mockTransactionData,
        methodCode: methodCodes[mockTransactionData.methodCode],
      };
      transactionRepoMock.saveTransaction.resolves(mockSavedTransaction);

      // Act
      const createdTransaction = await transactionService.createTransaction(
        mockTransactionData.date,
        mockTransactionData.amount,
        mockTransactionData.status,
        mockTransactionData.counterpartyName,
        mockTransactionData.methodCode,
        mockTransactionData.note
      );

      // Assert
      expect(createdTransaction).to.deep.equal(mockSavedTransaction);
    });
  });

  
});
