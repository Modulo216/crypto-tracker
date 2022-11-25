const express = require('express')
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express')
const { resolvers } = require("./data/resolvers.graphql")
const { typeDefs } = require("./data/schema.graphql")
const { getTrxs, getMultiWalletTrxes, getCoinPrice } = require("./api/coinbase")
const getCoinHistory = require("./api/coingecko")
const isAfter = require('date-fns/isAfter')
const formatISO = require('date-fns/formatISO')
const app = express()
const port = 5001

app.use(cors());
const server = new ApolloServer({ typeDefs, resolvers })
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

app.get('/update-history', async (req, res, next) => {
  try {
    let interests = await resolvers.Query.getInterests(null, { nickName: { $ne: '' } })
    let arr = []
    for (const interest of interests) {
      let result = await getCoinHistory.get(interest.nickName)
      for (const p of result.data.prices) {
        let then = formatISO(new Date(p[0])).slice(0, 10)
        if(formatISO(new Date()).slice(0, 10) === then || await resolvers.Query.findPriceHistory(null, {date: then, coin: interest.name}) !== null) {
          continue
        }
        arr.push({date: then, price: p[1].toString(), coin: interest.name})
      }
    }
    resolvers.Mutation.addPriceHistoryMany(null, { arr })
    arr.flat()
    console.log("UPDATE-HISTORY", arr)
    res.send(arr)
  } catch (error) {
    next(error)
  }
})

app.get('/rewards', async (req, res, next) => {
  try {
    let retVal = []
    let rewards = await getMultiWalletTrxes(req.query.c, false)
    for (const t of rewards) {
      let txns = t.transactions.filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.description !== null && (txn.description === 'Spending reward from Coinbase Card' || txn.description.includes('Debit Card Rewards')))
      for (const txn of txns) {
        let reward = { exchange: "Coinbase", coin: t.coin, updatedAt: txn.created_at, exchangeId: txn.id,
          amount: txn.amount.amount, value: txn.native_amount.amount, title: txn.details.title, subtitle: txn.details.subtitle }
        await resolvers.Mutation.addRewardImport(null, { reward: { ...reward } })
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
    let interests = await resolvers.Query.getInterests(null, { $or: [{ name: 'BTC'}, { name: 'ETH' }]})
    let allTrxs = await Promise.all([getTrxs(interests.find(i => i.name === 'BTC').cbaseWalletId, false), getTrxs(interests.find(i => i.name === 'ETH').cbaseWalletId, false)])
    let buyTrxs = allTrxs.flat().filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.type === "buy")
    let atfTrxs = allTrxs.flat().filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.type === "advanced_trade_fill")
    let atfSet = new Set(atfTrxs.map(atf => atf.advanced_trade_fill.order_id))
    
    for (const trx of buyTrxs) {
      await resolvers.Mutation.addInvestmentImport(null, { investment: { exchangeId: trx.id, updatedAt: trx.created_at, coin: trx.amount.currency, title: trx.details.title,
        subtitle: trx.details.subtitle, amount: trx.amount.amount, spent: trx.native_amount.amount, investType: 'buy', value: '0.00'
      }})
    }

    for (const atfId of atfSet) {
      let aftTrx = atfTrxs.filter(f => f.advanced_trade_fill.order_id === atfId)
      await resolvers.Mutation.addInvestmentImport(null, { investment: { exchangeId: atfId, updatedAt: aftTrx[0].created_at, coin: aftTrx[0].amount.currency, title: aftTrx[0].details.title, subtitle: aftTrx[0].details.subtitle,
        amount: aftTrx.map(t => t.amount).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0).toString(),
        spent: aftTrx.map(t => t.native_amount).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0).toString(), investType: 'atf',
        fillPrice: aftTrx[0].advanced_trade_fill.fill_price, value: '0.00'
      }})
    }
    res.send('OK')
  } catch (error) {
    next(error)
  }
})

app.get('/trxs', async (req, res, next) => {
  try {
    let usdcWallet = await resolvers.Query.findInterest(null, { interest : { name: 'USDC' }})
    let trxs = await getTrxs(usdcWallet.cbaseWalletId, false)
    let txns = trxs.filter(txn => isAfter(new Date(txn.created_at), new Date(2022, 0, 1)) && txn.type === 'cardspend')
    for (const txn of txns) {
      await resolvers.Mutation.addTrx(null, { trx: { amount: txn.native_amount.amount.replace(/^-/, ''), exchange: "coinbase", 
        updatedAt: txn.created_at, trxType: txn.type, exchangeId: txn.id, title: txn.details.title,subtitle: txn.details.subtitle } })
    }
    res.send('OK')
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
        if(t.coin === 'USDC' && txn.type !== 'interest') {
          continue
        }
        let tax = { exchange: "Coinbase", coin: t.coin === 'ETH2' ? 'ETH' : t.coin, updatedAt: txn.created_at, exchangeId: txn.id,
          amount: txn.amount.amount, value: txn.native_amount.amount, title: txn.details.title, subtitle: txn.details.subtitle }
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
  console.log(`Dolphin app listening on port ${port}!`)
})