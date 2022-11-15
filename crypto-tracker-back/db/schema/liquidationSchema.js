exports.liquidationSchema = void 0
const mongoose = require('mongoose')
exports.liquidationSchema = new mongoose.Schema({
  event: {
    type: String
  },
  usdAmount: {
    type: String
  },
  updatedAt: {
    type: String
  },
  coin: {
    type: String
  },
  coinAmount: {
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