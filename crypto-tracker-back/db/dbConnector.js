const mongoose = require('mongoose')
const { interestSchema } = require('./schema/interestSchema.js')
const { trxSchema } = require('./schema/trxSchema.js')
const { checkingSchema } = require('./schema/checkingSchema.js')

mongoose.connect('mongodb://127.0.0.1/my_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

let db = mongoose.connection
db.on('error', () => {
  console.error("Error while connecting to DB")
})

const Interest = mongoose.model('Interest', interestSchema)
const Trx = mongoose.model('Trx', trxSchema)
const Checking = mongoose.model('Checking', checkingSchema)

export { Interest, Trx, Checking }