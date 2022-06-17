exports.checkingSchema = void 0
const mongoose = require('mongoose')
exports.checkingSchema = new mongoose.Schema({
  date: {
    type: String
  },
  amount: {
    type: String
  },
  type: {
    type: String
  }
})