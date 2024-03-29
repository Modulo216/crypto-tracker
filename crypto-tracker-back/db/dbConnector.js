const mongoose = require('mongoose')
const { interestSchema } = require('./schema/interestSchema.js')
const { trxSchema } = require('./schema/trxSchema.js')
const { checkingSchema } = require('./schema/checkingSchema.js')
const { taxSchema } = require('./schema/taxSchema')
const { rewardSchema } = require('./schema/rewardSchema')
const { investmentSchema } = require('./schema/InvestmentSchema')
const { pHistorySchema } = require('./schema/pHistorySchema')
const { liquidationSchema } = require('./schema/liquidationSchema')
const { stockInvestmentSchema } = require('./schema/stockInvestmentSchema')
require('dotenv').config()

mongoose.connect(`mongodb+srv://${process.env.mongo_user}:${process.env.mongo_pass}@cluster0.3cejibv.mongodb.net/my_db?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

let db = mongoose.connection
db.on('error', () => {
  console.error("Error while connecting to DB")
})

liquidationSchema.set('toObject', { virtuals: true })
liquidationSchema.set('toJSON', { virtuals: true })

liquidationSchema.virtual('coin').get(function() {
  return (this.taxes.length && this.taxes[0].coin) || (this.rewards.length && this.rewards[0].coin) 
    || (this.investments.length && this.investments[0].coin) || (this.liquidations.length && this.liquidations[0].coin)
})

liquidationSchema.virtual('coinValue').get(function() {
  return this.rewards.map(i => i.value).reduce((prev, next) => prev + next, 0) + 
    this.taxes.map(i => i.value).reduce((prev, next) => prev + next, 0) +
    this.investments.map(i => i.spent).reduce((prev, next) => prev + next, 0) +
    this.liquidations.map(i => i.usdAmount).reduce((prev, next) => prev + next, 0)
})

liquidationSchema.virtual('coinAmount').get(function() {
  return this.rewards.map(i => i.amount).reduce((prev, next) => prev + next, 0) + 
    this.taxes.map(i => i.amount).reduce((prev, next) => prev + next, 0) +
    this.investments.map(i => i.amount).reduce((prev, next) => prev + next, 0) +
    this.liquidations.map(i => i.newCoinAmount).reduce((prev, next) => prev + next, 0)
})

liquidationSchema.virtual('coinUpdatedAt').get(function() {
  return new Date(Math.max(...this.rewards.map(i => new Date(i.updatedAt)),...this.taxes.map(i => new Date(i.updatedAt)),
    ...this.investments.map(i => new Date(i.updatedAt)), ...this.liquidations.map(i => new Date(i.updatedAt))))
})

const Interest = mongoose.model('Interest', interestSchema)
const Trx = mongoose.model('Trx', trxSchema)
const Checking = mongoose.model('Checking', checkingSchema)
const Tax = mongoose.model('Tax', taxSchema)
const Reward = mongoose.model('Reward', rewardSchema)
const Investment = mongoose.model('Investment', investmentSchema)
const PHistory = mongoose.model('PHistory', pHistorySchema)
const StockHistory = mongoose.model('StockHistory', pHistorySchema)
const Liquidation = mongoose.model('Liquidation', liquidationSchema)
const StockInvestment = mongoose.model('StockInvestment', stockInvestmentSchema)

export { Interest, Trx, Checking, Tax, Reward, Investment, Liquidation, PHistory, StockInvestment, StockHistory }