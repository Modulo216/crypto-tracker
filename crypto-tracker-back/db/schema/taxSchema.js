exports.taxSchema = void 0
const mongoose = require('mongoose')
exports.taxSchema = new mongoose.Schema({
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
    type: String
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
  activity: {
    type: String
  },
  liquidation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Liquidation'
  }
})