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
    type: String
  },
  spent: {
    type: String
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
    type: String
  },
  value: {
    type: String
  },
  liquidation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Liquidation'
  }
})