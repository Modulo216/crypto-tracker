const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { resolvers } = require("./data/resolvers.graphql")
const { typeDefs } = require("./data/schema.graphql")
const app = express()
const port = 5001

const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({ app })

app.get('/', (req, res) => {    
  res.send('Hello Root')
})                

app.listen(port, async () => {
  console.log(`Dolphin app listening on port ${port}!`)
})