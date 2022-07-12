const express = require('express')
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express')
const { resolvers } = require("./data/resolvers.graphql")
const { typeDefs } = require("./data/schema.graphql")
const { getTrxs, getMultiWalletTrxes } = require("./api/coinbase")
const isAfter = require('date-fns/isAfter')
const app = express()
const port = 5001

app.use(cors());
const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({ app })

app.get('/rewards', async (req, res) => {
  let interests = await resolvers.Query.getInterests(null, { isReward: true })
  let rows = await resolvers.Query.rewardExists()
  let rewards = await getMultiWalletTrxes(interests.map(i => i.name), rows === 0)

  rewards.forEach(t => {
    t.transactions.filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.description !== null && (txn.description === 'Spending reward from Coinbase Card' || txn.description.includes('Debit Card Rewards'))).forEach(txn => {
      let reward = { exchange: "Coinbase", coin: t.coin }
      reward.updatedAt = txn.created_at
      reward.exchangeId = txn.id
      reward.amount = txn.amount.amount
      reward.value = txn.native_amount.amount
      reward.title = txn.details.title
      reward.subtitle = txn.details.subtitle

      resolvers.Mutation.addRewardImport(null, { reward: { ...reward } })
    })
  })
  res.send('OK')
})

app.get('/investments', async (req, res) => {
  let btcWallet = await resolvers.Query.findInterest(null, { interest : { name: 'BTC' }})
  let ethWallet = await resolvers.Query.findInterest(null, { interest : { name: 'ETH' }})
  let trxs = await Promise.all([getTrxs(btcWallet.cbaseWalletId, true), getTrxs(ethWallet.cbaseWalletId, true)])

  trxs.forEach((allTrxs, index, array) => {
    allTrxs.filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.type === "buy").forEach(trx => {
      resolvers.Mutation.addInvestmentImport(null, { investment: { exchangeId: trx.id, updatedAt: trx.created_at, coin: trx.amount.currency, title: trx.details.title,
        subtitle: trx.details.subtitle, amount: trx.amount.amount, spent: trx.native_amount.amount, investType: 'buy', value: '0.00'
      }})
    })

    allTrxs.filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.details.title.includes('Converted to')).forEach(trx => {
      resolvers.Mutation.addInvestmentImport(null, { investment: { exchangeId: trx.id, updatedAt: trx.created_at, coin: trx.amount.currency, title: trx.details.title,
        subtitle: trx.details.payment_method_name, amount: trx.amount.amount, spent: '0.00', investType: 'convert', value: '0.00'
      }})
    })

    let atfTrxs = allTrxs.filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1)) && txn.type === "advanced_trade_fill")
    new Set(atfTrxs.map(atf => atf.advanced_trade_fill.order_id)).forEach(a => {
      let aftTrx = atfTrxs.filter(f => f.advanced_trade_fill.order_id === a)
      resolvers.Mutation.addInvestmentImport(null, { investment: { exchangeId: a, updatedAt: aftTrx[0].created_at, coin: aftTrx[0].amount.currency, title: aftTrx[0].details.title, subtitle: aftTrx[0].details.subtitle,
        amount: aftTrx.map(t => t.amount).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0).toString(),
        spent: aftTrx.map(t => t.native_amount).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0).toString(), investType: 'atf',
        fillPrice: aftTrx[0].advanced_trade_fill.fill_price, value: '0.00'
      }})
    })
  })
  res.send('OK')
})

app.get('/trxs', async (req, res) => {
  let usdcWallet = await resolvers.Query.findInterest(null, { interest : { name: 'USDC' }})
  let rows = await resolvers.Query.trxExists()

  let itemsProcessed = 0;
  await getTrxs(usdcWallet.cbaseWalletId, rows === 0).then(txns => {
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

app.get('/taxes', async (req, res) => {
  let interests = await resolvers.Query.getInterests(null, { isTax: true })
  let rows = await resolvers.Query.taxExists()

  let taxes = await getMultiWalletTrxes(interests.map(i => i.name), rows === 0)
  
  taxes.forEach(t => {
    t.transactions.filter(txn => isAfter(new Date(txn.created_at), new Date(2021, 7, 1))).forEach(txn => {
      if(txn.type === 'trade' ||
        txn.description === 'Spending reward from Coinbase Card' ||
        txn.description === 'R7 - US Debit Card Rewards (external funded)' ||
        txn.to !== undefined ||
        (t.coin === 'USDC' && txn.type !== 'interest')) {
        return
      }

      let tax = { exchange: "Coinbase", coin: t.coin }
      tax.updatedAt = txn.created_at
      tax.exchangeId = txn.id
      tax.amount = txn.amount.amount
      tax.value = txn.native_amount.amount
      tax.title = txn.details.title
      tax.subtitle = txn.details.subtitle

      if(txn.type === 'staking_reward') {
        tax.activity = 'Staking'
      } else if (txn.type === 'interest') {
        tax.activity = 'Interest'
      } else if (txn.description === 'Earn Task' || txn.details.subtitle === 'From Coinbase Earn') {
        tax.activity = 'Learn & Earn'
      }

      resolvers.Mutation.addTaxImport(null, { tax: { ...tax } })
    })
  })

  res.send('OK')
})

app.listen(port, async () => {
  console.log(`Dolphin app listening on port ${port}!`)
})