exports.interestSchema = void 0
const mongoose = require('mongoose')
exports.interestSchema = new mongoose.Schema({
  nickName: {
    type: String
  },
  name: {
    type: String
  },
  currencyPair: {
    type: String
  },
  cbaseWalletId: {
    type: String
  },
  wallet: {
    type: String
  },
})