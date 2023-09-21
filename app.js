const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');


const app = express();
app.use(bodyParser.json());



// Read the config file
const configFile = path.join(__dirname, 'config.json');
const configData = fs.readFileSync(configFile, 'utf8');
const config = JSON.parse(configData);

// Access configuration settings
const serverPort = config.server.port;
const dbUrl = config.database.url;


// graphql settings
app.use(
    '/graphql',
    graphqlHTTP({
        schema: graphqlSchema,
        rootValue: graphqlResolver,
        graphiql: true,
    }),
);


// DB connection setup
mongoose
  .connect(
    dbUrl
  )
  .then(result => {
    app.listen(serverPort);
  })
  .catch(err => console.log(err));

module.exports = app
