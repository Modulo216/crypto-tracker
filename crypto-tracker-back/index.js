const express = require('express')
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express')
const { resolvers } = require("./data/resolvers.graphql")
const { typeDefs } = require("./data/schema.graphql")
import { typeDefs as scalarTypeDefs, resolvers as scalarResolvers } from 'graphql-scalars'
const { getTrxs, getMultiWalletTrxes, getCoinPrice } = require("./api/coinbase")
const { order } = require('./api/binance')
const getCoinHistory = require("./api/coingecko")
import { formatISO, isAfter } from 'date-fns'
const app = express()
const port = 5001

app.use(cors());
const server = new ApolloServer({ typeDefs: [...scalarTypeDefs, typeDefs], resolvers: { ...scalarResolvers, ...resolvers } })
server.applyMiddleware({ app })

const errorHandler = (error, request, response, next) => {
  console.log( `error ${error.message}`)
  const status = error.status || 400
  response.status(status).send(error.message)
}

app.get('/coin-prices', async (req, res, next) => {
  try {
    let prices = await getCoinPrice(req.query.c)
    res.send(prices)
  } catch (error) {
    next(error)
  }
})

app.get('/update-rows', async (req, res, next) => {
  await resolvers.Mutation.updateRows(null, {id: 1})
})

app.get('/update-history2', async (req, res, next) => {
  try {
    let interests = await resolvers.Query.getInterests(null, { nickName: { $ne: '' } })
    let arr = []
    let pHistoryArr = []
    for (const interest of interests) {
      let result = await getCoinHistory.get(interest.nickName)
      for (const p of result.data.prices.filter(p => new Date().getDate() !== new Date(p[0]).getDate())) {        
        arr.push({date: new Date(p[0]).setHours(0,0,0,0), price: p[1], coin: interest.name})
      }
    }

    for (const uniqueDate of new Set(arr.map(a => a.date))) {
      if (await resolvers.Query.findPHistory(null, { updatedAt: { $gte: new Date(uniqueDate).setHours(0,0,0,0), $lte: new Date(uniqueDate).setHours(23,59,59,999) }}) !== null) {
        continue
      }
      let pHistory = { updatedAt: new Date(uniqueDate), prices: [ ...arr.filter(a => a.date === uniqueDate).map(a => { return { coin: a.coin, price: a.price }}) ] }
      pHistoryArr.push(pHistory)
    }
    resolvers.Mutation.addPHistoryMany(null, pHistoryArr)

    console.log("UPDATE-HISTORY", pHistoryArr)
    res.send(pHistoryArr)
  } catch (error) {
    next(error)
  }
})

app.get('/_health', async (req, res) => {
  const healthcheck = { uptime: process.uptime(), message: 'OK', timestamp: Date.now() }
  try {
    let interests = await resolvers.Query.getInterests(null, { nickName: { $ne: '' } })
    healthcheck.interestscount = interests.length
    res.send(healthcheck)
  } catch (error) {
    res.status(503).send()
  }
})

app.get('/rewards', async (req, res, next) => {
  try {
    let retVal = []
    let rewards = await getMultiWalletTrxes(req.query.c, false)
    for (const t of rewards) {
      let txns = t.transactions.filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.description !== null && (txn.description === 'Spending reward from Coinbase Card' || txn.description.includes('Debit Card Rewards')))
      for (const txn of txns) {
        let reward = { exchange: "Coinbase", coin: t.coin, updatedAt: new Date(txn.created_at), exchangeId: txn.id,
          amount: parseFloat(txn.amount.amount), value: parseFloat(txn.native_amount.amount), title: txn.details.title, subtitle: txn.details.subtitle }
        await resolvers.Mutation.addRewardImport(null, { reward: reward  })
        reward.liquidation = null
        retVal.push(reward)
      }
    }
    res.send(retVal)
  } catch (error) {
    next(error)
  }
})

app.get('/investments', async (req, res, next) => {
  try {
    let retVal = []
    let interests = await resolvers.Query.getInterests(null, { $or: [{ name: 'BTC'}, { name: 'ETH' }]})
    let allTrxs = await Promise.all([getTrxs(interests.find(i => i.name === 'BTC').cbaseWalletId, false), getTrxs(interests.find(i => i.name === 'ETH').cbaseWalletId, false)])
    let buyTrxs = allTrxs.flat().filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.type === "buy")
    let atfTrxs = allTrxs.flat().filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.type === "advanced_trade_fill")
    let atfSet = new Set(atfTrxs.map(atf => atf.advanced_trade_fill.order_id))
    
    for (const trx of buyTrxs) {
      let inv = { exchangeId: trx.id, updatedAt: new Date(trx.created_at), coin: trx.amount.currency,
        amount: parseFlat(trx.amount.amount), spent: parseFlat(trx.native_amount.amount), investType: 'buy', value: '0.00' }
      await resolvers.Mutation.addInvestmentImport(null, { investment: inv })
      inv.liquidation = null
      retVal.push(inv)
    }

    for (const atfId of atfSet) {
      let aftTrx = atfTrxs.filter(f => f.advanced_trade_fill.order_id === atfId)
      let inv = { exchangeId: atfId, updatedAt: new Date(aftTrx[0].created_at), coin: aftTrx[0].amount.currency,
        amount: aftTrx.map(t => t.amount).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0),
        spent: aftTrx.map(t => t.native_amount).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0), investType: 'atf',
        fillPrice: parseFloat(aftTrx[0].advanced_trade_fill.fill_price), value: '0.00' }
      await resolvers.Mutation.addInvestmentImport(null, { investment: inv})
      inv.liquidation = null
      retVal.push(inv)
    }
    res.send(retVal)
  } catch (error) {
    next(error)
  }
})

app.get('/trxs', async (req, res, next) => {
  try {
    let retVal = []
    let trxs = await getTrxs(req.query.cwi, false)
    let txns = trxs.filter(txn => isAfter(new Date(txn.created_at), new Date(new Date().getUTCFullYear(), 0, 1)) && txn.type === 'cardspend')
    for (const txn of txns) {
      let trx = { amount: parseFloat(txn.native_amount.amount.replace(/^-/, '')), exchange: "coinbase", updatedAt: new Date(txn.created_at),
      trxType: txn.type, exchangeId: txn.id, title: txn.details.title,subtitle: txn.details.subtitle }
      await resolvers.Mutation.addTrx(null, { trx: trx })
      retVal.push(trx)
    }
    res.send(retVal)
  } catch (error) {
    next(error)
  }
})

app.get('/taxes', async (req, res, next) => {
  try {
    let retVal = []
    let taxes = await getMultiWalletTrxes(req.query.c, false)

    for (const t of taxes) {
      let txns = t.transactions.filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.type !== 'trade'
      && txn.description !== 'Spending reward from Coinbase Card' && txn.description !== 'R7 - US Debit Card Rewards (external funded)' && txn.to === undefined)
      for (const txn of txns) {
        if((t.coin === 'USDC' && txn.type !== 'interest') || txn.details.subtitle === 'From Unknown') {
          continue
        }
        let tax = { exchange: "Coinbase", coin: t.coin === 'ETH2' ? 'ETH' : t.coin, updatedAt: new Date(txn.created_at), exchangeId: txn.id,
          amount: parseFloat(txn.amount.amount), value: parseFloat(txn.native_amount.amount), title: txn.details.title, subtitle: txn.details.subtitle }
        if(txn.type === 'staking_reward') {
          tax.activity = 'Staking'
        } else if (txn.type === 'interest') {
          tax.activity = 'Interest'
        } else if (txn.description === 'Earn Task' || txn.details.subtitle === 'From Coinbase Earn') {
          tax.activity = 'Learn & Earn'
        }
        await resolvers.Mutation.addTaxImport(null, { tax: { ...tax } })
        tax.liquidation = null
        retVal.push(tax)
      }
    }
    res.send(retVal)
  } catch (error) {
    next(error)
  }
})
app.use(errorHandler)

app.listen(port, async () => {
  //await order()
  console.log(`Dolphin app listening on port ${port}!`)
})