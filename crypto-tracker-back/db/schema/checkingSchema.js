exports.checkingSchema = void 0
const mongoose = require('mongoose')
exports.checkingSchema = new mongoose.Schema({
  date: {
    type: String
  },
  amount: {
    type: mongoose.Schema.Types.Number,
    get: v => parseFloat(v)
  },
  type: {
    type: String
  }
})