exports.liquidationSchema = void 0
const mongoose = require('mongoose')
exports.liquidationSchema = new mongoose.Schema({
  taxable: { // always
    type: Boolean,
    default: false
  },
  event: { // always
    type: String,
    enum: ['Sell', 'Swap']
  },
  usdAmount: { // always (Proceeds) $1.12
    type: String
  },
  updatedAt: { // always
    type: String
  },
  newCoin: { // Swap -- drop down of interests
    type: String
  },
  newCoinAmount: { // Swap
    type: String
  },
  model_type: {
    type: String,
    enum: ['Reward', 'Tax', 'Investment']
  },
  liquid: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'model_type'
  }]
})