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

  describe("updateTransaction", () => {
    it("should update a transaction", async () => {
      // Arrange
      const mockTransactionId = "123456";
      const mockUpdatedData = {
        amount: 1500,
        status: "Posted",
        note: "Updated transaction",
      };

      const mockExistingTransaction = {
        _id: mockTransactionId,
        amount: 1000,
        status: "Pending",
        note: "Test transaction",
      };

      transactionRepoMock.findTransactionById.resolves(mockExistingTransaction);
      transactionRepoMock.saveTransaction.resolves({
        ...mockExistingTransaction,
        ...mockUpdatedData,
      });

      // Act
      const updatedTransaction = await transactionService.updateTransaction(
        mockTransactionId,
        mockUpdatedData.amount,
        mockUpdatedData.status,
        mockUpdatedData.note
      );

      // Assert
      expect(updatedTransaction).to.deep.equal({
        ...mockExistingTransaction,
        ...mockUpdatedData,
      });
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction", async () => {
      // Arrange
      const mockTransactionId = "123456";

      // Act
      await transactionService.deleteTransaction(mockTransactionId);

      // Assert
      expect(
        transactionRepoMock.deleteTransaction.calledOnceWith(mockTransactionId)
      ).to.be.true;
    });
  });
  
});
