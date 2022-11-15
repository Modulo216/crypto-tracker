exports.rewardSchema = void 0
const mongoose = require('mongoose')
exports.rewardSchema = new mongoose.Schema({
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
    type: String
  },
  value: {
    type: String
  },
  title: {
    type: String
  },
  subtitle: {
    type: String
  },
  liquidation : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Liquidation'
  }
})