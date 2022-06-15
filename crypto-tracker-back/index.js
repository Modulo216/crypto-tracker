const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { resolvers } = require("./data/resolvers.graphql")
const { typeDefs } = require("./data/schema.graphql")
const { getUsdcTrxs } = require("./api/coinbase")
const app = express()
const port = 5001

const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({ app })

app.get('/', (req, res) => {    
  res.send('Hello Root')
})                

app.listen(port, async () => {
  console.log(`Dolphin app listening on port ${port}!`)
  // getUsdcTrxs().then(txns => {
  //   txns.forEach(txn => {
  //     const txnInput = { trx: { amount: txn.native_amount.amount, exchange: "coinbase", 
  //       updatedAt: txn.updated_at, trxType: txn.type, exchangeId: txn.id, title: txn.details.title,
  //       subtitle: txn.details.subtitle } }
  //     resolvers.Mutation.addTrx(null, txnInput)
  //   });
  // })
})