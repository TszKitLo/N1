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

  describe("findAllTransactions", () => {
    it("should find all transactions", async () => {
      // Arrange
      const mockTransactions = [
        { _id: "1", amount: 1000, status: "Pending" },
        { _id: "2", amount: 1500, status: "Posted" },
      ];

      transactionRepoMock.findAllTransactions.resolves(mockTransactions);

      // Act
      const transactions = await transactionService.findAllTransactions();

      // Assert
      expect(transactions).to.deep.equal(mockTransactions);
    });
  });

  describe("findTransactionsByMethodName", () => {
    it("should find transactions by method name", async () => {
      // Arrange
      const methodName = "ACH";
      const mockTransactions = [
        { _id: "1", amount: 1000, status: "Pending", methodCode: "ACH" },
        { _id: "2", amount: 1500, status: "Posted", methodCode: "ACH" },
      ];

      transactionRepoMock.findTransactionsByMethodName.resolves(
        mockTransactions
      );

      // Act
      const transactions =
        await transactionService.findTransactionsByMethodName(methodName);

      // Assert
      expect(transactions).to.deep.equal(mockTransactions);
    });
  });

  describe("getSumOfAllTransactions", () => {
    it("should calculate the sum of all transactions", async () => {
      // Arrange
      const mockSum = 2500;

      transactionRepoMock.sumOfAllTransactions.resolves(mockSum);

      // Act
      const sum = await transactionService.getSumOfAllTransactions();

      // Assert
      expect(sum).to.equal(mockSum);
    });
  });
});
