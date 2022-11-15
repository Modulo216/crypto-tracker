const mongoose = require('mongoose')
const { interestSchema } = require('./schema/interestSchema.js')
const { trxSchema } = require('./schema/trxSchema.js')
const { checkingSchema } = require('./schema/checkingSchema.js')
const { taxSchema } = require('./schema/taxSchema')
const { rewardSchema } = require('./schema/rewardSchema')
const { investmentSchema } = require('./schema/investmentSchema')
const { priceHistorySchema } = require('./schema/priceHistorySchema')
const { liquidationSchema } = require('./schema/liquidationSchema')

mongoose.connect('mongodb://127.0.0.1/my_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

let db = mongoose.connection
db.on('error', () => {
  console.error("Error while connecting to DB")
})

const Interest = mongoose.model('Interest', interestSchema)
const Trx = mongoose.model('Trx', trxSchema)
const Checking = mongoose.model('Checking', checkingSchema)
const Tax = mongoose.model('Tax', taxSchema)
const Reward = mongoose.model('Reward', rewardSchema)
const Investment = mongoose.model('Investment', investmentSchema)
const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema)
const Liquidation = mongoose.model('Liquidation', liquidationSchema)

export { Interest, Trx, Checking, Tax, Reward, Investment, PriceHistory, Liquidation }