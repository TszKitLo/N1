const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Transaction {
        _id: ID!
        date: String!
        amount: Float!
        status: String!
        counterpartyName: String
        methodCode: String!
        note: String
    }

    type MethodCode {
        code: Int!
        name: String!
    }

    input TransactionInputData {
        date: String!
        amount: Float!
        status: String!
        counterpartyName: String
        methodCode: Int
        note: String
    }

    type RootQuery {

    }

    type RootMutation {
        createTransaction(transactionInputData: TransactionInputData): Transaction!

    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
