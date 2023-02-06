exports.investmentSchema = void 0
const mongoose = require('mongoose')
exports.investmentSchema = new mongoose.Schema({
  exchangeId: {
    type: String
  },
  coin: {
    type: String
  },
  updatedAt: {
    type: String
  },
  amount: {
    type: mongoose.Schema.Types.Number,
    get: v => parseFloat(v)
  },
  spent: {
    type: mongoose.Schema.Types.Number,
    get: v => parseFloat(v)
  },
  title: {
    type: String
  },
  subtitle: {
    type: String
  },
  investType: {
    type: String
  },
  fillPrice: {
    type: mongoose.Schema.Types.Number,
    get: v => parseFloat(v)
  },
  value: {
    type: String
  },
  liquidation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Liquidation'
  }
})