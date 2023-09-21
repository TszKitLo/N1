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

    input UpdateTransactionInputData {
        _id: ID!
        amount: Float
        status: String
        note: String
    }

    type RootQuery {
        findAllTransactions: [Transaction]!
        findTransactionsByMethodName(methodName: String!): [Transaction]!
        getCurrentAccountBalance: Float
        getMethodCodeMapping: [MethodCode!]!
    }

    type RootMutation {
        createTransaction(transactionInputData: TransactionInputData): Transaction!
        updateTransaction(updateTransactionInputData: UpdateTransactionInputData): Transaction!
        deleteTransaction(_id: ID!): Boolean
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
