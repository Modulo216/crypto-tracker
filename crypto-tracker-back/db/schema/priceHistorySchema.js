exports.priceHistorySchema = void 0
const mongoose = require('mongoose')
exports.priceHistorySchema = new mongoose.Schema({
  date: {
    type: String
  },
  coin: {
    type: String
  },
  price: {
    type: String
  }
})