exports.pHistorySchema = void 0
const mongoose = require('mongoose')
exports.pHistorySchema = new mongoose.Schema({
  updatedAt: Date,
  prices: { type : Array , default : [] }
})