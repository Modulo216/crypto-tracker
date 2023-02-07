exports.liquidationSchema = void 0
const mongoose = require('mongoose')
exports.liquidationSchema = new mongoose.Schema({
  taxable: {
    type: Boolean,
    default: false
  },
  event: {
    type: String,
    enum: ['Sell', 'Swap']
  },
  usdAmount: {
    type: mongoose.Schema.Types.Number,
    get: v => parseFloat(v)
  },
  updatedAt: {
    type: Date
  },
  newCoin: {
    type: String
  },
  newCoinAmount: {
    type: mongoose.Schema.Types.Number,
    get: v => v ? parseFloat(v) : undefined
  },
  taxes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Tax'
  }],
  rewards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Reward'
  }],
  investments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Investment'
  }],
  liquidations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Liquidation'
  }],
  liquidation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Liquidation'
  }
})