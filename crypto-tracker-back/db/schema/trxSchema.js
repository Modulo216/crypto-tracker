exports.trxSchema = void 0
const mongoose = require('mongoose')
exports.trxSchema = new mongoose.Schema({
  exchange: {
    type: String
  },
  exchangeId: {
    type: String
  },
  trxType: {
    type: String
  },
  updatedAt: {
    type: String
  },
  amount: {
    type: String
  },
  merchant: {
    type: String
  },
  title: {
    type: String
  },
  subtitle: {
    type: String
  },
  category: {
    type: String
  }
})