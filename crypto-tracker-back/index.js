const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { resolvers } = require("./data/resolvers.graphql")
const { typeDefs } = require("./data/schema.graphql")
const { getTrxs } = require("./api/coinbase")
const app = express()
const port = 5001

const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({ app })

app.get('/', (req, res) => {    
  res.send('Hello Root')
})                

app.listen(port, async () => {
  console.log(`Dolphin app listening on port ${port}!`)
  let usdcWallet = await resolvers.Query.findInterest(null, { interest : { name: 'USDC' }})
  // getTrxs(usdcWallet.cbaseWalletId).then(txns => {
  //   txns.filter(txn => new Date(txn.updated_at) > new Date('2022-05-01') && txn.type === 'cardspend').forEach(txn => {
  //     const txnInput = { trx: { amount: txn.native_amount.amount.replace(/^-/, ''), exchange: "coinbase", 
  //       updatedAt: txn.updated_at, trxType: txn.type, exchangeId: txn.id, title: txn.details.title,
  //       subtitle: txn.details.subtitle } }
  //     resolvers.Mutation.addTrx(null, txnInput)
  //   });
  // })
})