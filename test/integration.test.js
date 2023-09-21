const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('../graphql/schema');
const graphqlResolver = require('../graphql/resolvers');
const chai = require('chai');
const { describe, it, before, after, beforeEach, afterEach } = require('mocha');
const expect = chai.expect;
const { methodCodes } = require('../models/methodCodes');

let mongoServer;
let app;

async function connectToMongoDB() {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function closeMongoDBConnection() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

async function sendGraphQLRequest(query) {
  return request(app)
    .post('/graphql')
    .send({ query })
    .set('Content-Type', 'application/json');
}

beforeEach(async () => {
  await connectToMongoDB();
  app = express();
  app.use(
    '/graphql',
    graphqlHTTP({
      schema: graphqlSchema,
      rootValue: graphqlResolver,
      graphiql: true,
    })
  );
});

afterEach(async () => {
  await closeMongoDBConnection();
});

describe('Integration test', () => {
  it('should create a transaction', async () => {
    const query = `mutation {
      createTransaction(transactionInputData: {
        date: "2001-12-25T23:15:30",
        amount: 1122,
        methodCode: 34,
        status: "Pending",
        note: "Test"
      }) {
        _id
        amount
        date
        status
        counterpartyName
        methodCode
        note
      }
    }`;

    const res = await sendGraphQLRequest(query);
    const responseData = res.body.data.createTransaction;

    expect(responseData.amount).to.equal(1122);
    expect(responseData.date).to.equal("1009340130000");
    expect(responseData.status).to.equal("Pending");
    expect(responseData.counterpartyName).to.be.null;
    expect(responseData.methodCode).to.equal("ACH");
    expect(responseData.note).to.equal("Test");
  });

  it('should fail to create a transaction when amount is missing', async () => {
    const query = `mutation {
      createTransaction(transactionInputData: {
        date: "2001-12-25T23:15:30",
        methodCode: 34,
        status: "Pending",
        note: "Test"
      }) {
        _id
        amount
        date
        status
        counterpartyName
        methodCode
        note
      }
    }`;

    const res = await sendGraphQLRequest(query);
    expect(res.status).to.equal(400);
  });

  it('should create a transaction with methodCode "Outgoing" when amount is negative', async () => {
    const query = `mutation {
      createTransaction(transactionInputData: {
        date: "2001-12-25T23:15:30",
        amount: -32,
        status: "Pending",
        note: "Test"
      }) {
        _id
        amount
        date
        status
        counterpartyName
        methodCode
        note
      }
    }`;

    const res = await sendGraphQLRequest(query);
    const responseData = res.body.data.createTransaction;

    expect(responseData.amount).to.equal(-32);
    expect(responseData.methodCode).to.equal("Outgoing");
  });

  it('should update a transaction', async () => {
    const createTransactionQuery = `mutation {
      createTransaction(transactionInputData: {
        date: "2001-12-25T23:15:30",
        amount: 1122,
        methodCode: 34,
        status: "Pending",
        note: "Test"
      }) {
        _id
        amount
        date
        status
        counterpartyName
        methodCode
        note
      }
    }`;

    const createTransactionRes = await sendGraphQLRequest(createTransactionQuery);
    const transactionId = createTransactionRes.body.data.createTransaction._id;

    const updateTransactionQuery = `mutation {
      updateTransaction(updateTransactionInputData: {
        _id: "${transactionId}",
        note: "UpdateTest"
      }) {
        _id
        amount
        date
        status
        counterpartyName
        methodCode
        note
      }
    }`;

    const updateRes = await sendGraphQLRequest(updateTransactionQuery);
    const updateTransactionRes = updateRes.body.data.updateTransaction;

    expect(updateTransactionRes._id).to.equal(transactionId);
    expect(updateTransactionRes.amount).to.equal(1122);
    expect(updateTransactionRes.date).to.equal("1009340130000");
    expect(updateTransactionRes.status).to.equal("Pending");
    expect(updateTransactionRes.counterpartyName).to.be.null;
    expect(updateTransactionRes.methodCode).to.equal("ACH");
    expect(updateTransactionRes.note).to.equal("UpdateTest");
  });

  it('should delete a transaction', async () => {
    const createTransactionQuery = `mutation {
      createTransaction(transactionInputData: {
        date: "2001-12-25T23:15:30",
        amount: 1122,
        methodCode: 34,
        status: "Pending",
        note: "Test"
      }) {
        _id
      }
    }`;

    const createTransactionRes = await sendGraphQLRequest(createTransactionQuery);
    const transactionId = createTransactionRes.body.data.createTransaction._id;

    const deleteTransactionQuery = `mutation {
      deleteTransaction(_id: "${transactionId}")
    }`;

    const deleteRes = await sendGraphQLRequest(deleteTransactionQuery);
    expect(deleteRes.body.data.deleteTransaction).to.be.true;
  });

  it('should query all transactions', async () => {
    const query = `mutation {
      createTransaction(transactionInputData: {
        date: "2001-12-25T23:15:30",
        amount: 1122,
        methodCode: 34,
        status: "Pending",
        note: "Test"
      }) {
        _id
        amount
        date
        status
        counterpartyName
        methodCode
        note
      }
    }`;

    await sendGraphQLRequest(query);

    const findAllTransactionsQuery = `query {
      findAllTransactions {
        _id
        date
        amount
        status
        counterpartyName
        methodCode
        note
      }
    }`;

    const findAllTransactionsRes = await sendGraphQLRequest(findAllTransactionsQuery);
    expect(findAllTransactionsRes.body.data.findAllTransactions).to.have.lengthOf(1);
  });

  it('should query transactions by method name', async () => {
    const methodCode = 34; // ACH

    const query = `mutation {
      createTransaction(transactionInputData: {
        date: "2001-12-25T23:15:30",
        amount: 1122,
        methodCode: ${methodCode},
        status: "Pending",
        note: "Test"
      }) {
        _id
        amount
        date
        status
        counterpartyName
        methodCode
        note
      }
    }`;

    await sendGraphQLRequest(query);

    const findTransactionsByMethodNameQuery = `query {
      findTransactionsByMethodName(methodName: "${methodCodes[methodCode]}") {
        _id
        date
        amount
        status
        counterpartyName
        methodCode
        note
      }
    }`;

    const findTransactionsByMethodNameRes = await sendGraphQLRequest(findTransactionsByMethodNameQuery);
    const result = findTransactionsByMethodNameRes.body.data.findTransactionsByMethodName;

    expect(result).to.have.lengthOf(1);
    expect(result[0].methodCode).to.equal(methodCodes[methodCode]);
  });

  it('should get current account balance', async () => {
    const methodCode = 34; // ACH
    const amount = 1133;

    const query = `mutation {
      createTransaction(transactionInputData: {
        date: "2001-12-25T23:15:30",
        amount: ${amount},
        methodCode: ${methodCode},
        status: "Pending",
        note: "Test"
      }) {
        _id
        amount
        date
        status
        counterpartyName
        methodCode
        note
      }
    }`;

    await sendGraphQLRequest(query);

    const getCurrentAccountBalanceQuery = `query {
      getCurrentAccountBalance
    }`;

    const getCurrentAccountBalanceRes = await sendGraphQLRequest(getCurrentAccountBalanceQuery);
    const result = getCurrentAccountBalanceRes.body.data.getCurrentAccountBalance;

    expect(result).to.equal(amount);
  });
});
