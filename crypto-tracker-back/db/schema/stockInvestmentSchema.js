exports.stockInvestmentSchema = void 0
const mongoose = require('mongoose')
exports.stockInvestmentSchema = new mongoose.Schema({
  updatedAt: {
    type: Date
  },
  kind: {
    type: String
  },
  stockSymbol: {
    type: String
  },
  spent: {
    type: mongoose.Schema.Types.Number,
    get: v => parseFloat(v)
  },
  match: {
    type: mongoose.Schema.Types.Number,
    get: v => parseFloat(v)
  },
  amount: {
    type: mongoose.Schema.Types.Number,
    get: v => parseFloat(v)
  },
})