exports.rewardSchema = void 0
const mongoose = require('mongoose')
exports.rewardSchema = new mongoose.Schema({
  exchange: {
    type: String
  },
  exchangeId: {
    type: String
  },
  coin: {
    type: String
  },
  updatedAt: {
    type: Date
  },
  amount: {
    type: mongoose.Schema.Types.Number,
    get: v => parseFloat(v)
  },
  value: {
    type: mongoose.Schema.Types.Number,
    get: v => parseFloat(v)
  },
  title: {
    type: String
  },
  subtitle: {
    type: String
  },
  liquidation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Liquidation'
  }
})