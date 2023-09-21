const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('../graphql/schema');
const graphqlResolver = require('../graphql/resolvers');

const chai = require('chai');
const { describe, it, before, after } = require('mocha');
const expect = chai.expect;

const {methodCodes} = require('../models/methodCodes')

let mongoServer;
let app;

beforeEach(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
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
  
  
});

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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

    const res = await request(app)
      .post('/graphql')
      .send({ query })
      .set('Content-Type', 'application/json')
      .expect(200);

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

    await request(app)
      .post('/graphql')
      .send({ query })
      .set('Content-Type', 'application/json')
      .expect(400);
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

    const res = await request(app)
      .post('/graphql')
      .send({ query })
      .set('Content-Type', 'application/json')
      .expect(200);

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

    const createTransactionRes = await request(app)
      .post('/graphql')
      .send({ query: createTransactionQuery })
      .set('Content-Type', 'application/json')
      .expect(200);

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

    const updateRes = await request(app)
      .post('/graphql')
      .send({ query: updateTransactionQuery })
      .set('Content-Type', 'application/json')
      .expect(200);

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

    const createTransactionRes = await request(app)
      .post('/graphql')
      .send({ query: createTransactionQuery })
      .set('Content-Type', 'application/json')
      .expect(200);

    const transactionId = createTransactionRes.body.data.createTransaction._id;

    const deleteTransactionQuery = `mutation {
      deleteTransaction(_id: "${transactionId}")
    }`;

    const deleteRes = await request(app)
      .post('/graphql')
      .send({ query: deleteTransactionQuery })
      .set('Content-Type', 'application/json')
      .expect(200);

    expect(deleteRes.body.data.deleteTransaction).to.be.true;
  });


});
