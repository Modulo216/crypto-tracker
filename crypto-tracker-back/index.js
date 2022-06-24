const express = require('express')
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express')
const { resolvers } = require("./data/resolvers.graphql")
const { typeDefs } = require("./data/schema.graphql")
const { getTrxs } = require("./api/coinbase")
const isAfter = require('date-fns/isAfter')
const app = express()
const port = 5001

app.use(cors());
const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({ app })

app.get('/trxs', async (req, res) => {
  let usdcWallet = await resolvers.Query.findInterest(null, { interest : { name: 'USDC' }})

  let itemsProcessed = 0;
  await getTrxs(usdcWallet.cbaseWalletId).then(txns => {
    txns.filter(txn => isAfter(new Date(txn.created_at), new Date(2022, 0, 1)) && txn.type === 'cardspend').forEach((txn, index, array) => {
      resolvers.Mutation.addTrx(null, { trx: { amount: txn.native_amount.amount.replace(/^-/, ''), exchange: "coinbase", 
        updatedAt: txn.created_at, trxType: txn.type, exchangeId: txn.id, title: txn.details.title,subtitle: txn.details.subtitle } })
        itemsProcessed++
        
        if(itemsProcessed === array.length) {
          res.send('OK')
        }
    })
  })
})            

app.listen(port, async () => {
  console.log(`Dolphin app listening on port ${port}!`)
})