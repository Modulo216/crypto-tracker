import { Interest, Trx, Checking, Tax, Reward, Investment, PriceHistory } from "../db/dbConnector.js"
const { isBefore } = require('date-fns')
const formatISO = require('date-fns/formatISO')

export const resolvers = {
  Query: {
    getInterests: async (root, query) => {
      return await Interest.find({...query})
    },
    findInterest: async (root, { interest }) => {
      return await Interest.findOne({ name: interest.name })
    },
    findPriceHistory: async (root, query) => {
      return await PriceHistory.findOne({...query})
    },
    getTrxs: async (root) => {
      return await Trx.find()
    },
    getChecking: async (root) => {
      return await Checking.find()
    },
    taxExists: async (root) => {
      let taxes = await Tax.find().lean()
      return taxes.length
    },
    trxExists: async (root) => {
      let trxs = await Trx.find().lean()
      return trxs.length
    },
    rewardExists: async (root) => {
      let rewards = await Reward.find().lean()
      return rewards.length
    },
    getTaxes: async (root) => {
      let taxes = await Tax.find()
      taxes.sort((d1, d2) => new Date(d1.updatedAt).getTime() - new Date(d2.updatedAt).getTime())
      
      return taxes
    },
    getInvestments: async (root) => {
      let investments = await Investment.find()
      investments.sort((d1, d2) => new Date(d1.updatedAt).getTime() - new Date(d2.updatedAt).getTime())
      
      return investments
    },
    getRewards: async (root) => {
      let rewards = await Reward.find()
      rewards.sort((d1, d2) => new Date(d1.updatedAt).getTime() - new Date(d2.updatedAt).getTime())
      
      return rewards
    },
    getPriceHistory: async (root) => {
      let priceHistory = await PriceHistory.find()
      priceHistory.sort((d1, d2) => new Date(d1.date).getTime() - new Date(d2.date).getTime())
      
      return priceHistory
    }
  },
  Mutation: {
    addChecking: async (root, { checking }) => {
      const { ...rest } = checking
      const newChecking = new Checking({ ...rest })
      
      return await newChecking.save()
    },
    addPriceHistory: async (root, { priceHistory }) => {
      const { ...rest } = priceHistory
      const newPriceHistory = new PriceHistory({ ...rest })
      
      return await newPriceHistory.save()
    },
    deletePriceHistoryMany: async (root, { priceHistory }) => {
      let priceHistories = await PriceHistory.find()
      let toDel = priceHistories.filter(i => isBefore(getDateAsUtc(i.date), getDateAsUtc(priceHistory.date)) && i.coin === priceHistory.coin)

      toDel.forEach(async p => {
        await PriceHistory.findByIdAndRemove(p.id)
      })
    },
    addPriceHistoryMany: async (root, {coin, priceHistories}) => {  
      let arr = []

      for (const p of priceHistories) {
        let then = formatISO(new Date(p[0])).slice(0, 10)
        let exists = await resolvers.Query.findPriceHistory(root, {date: then, coin: coin})
        if(formatISO(new Date()).slice(0, 10) !== then && exists === null) {
          let priceHistory = new PriceHistory({date: then, price: p[1].toString(), coin: coin})
          arr.push(priceHistory)
        }
      }

      if(arr.length > 0) {
        await PriceHistory.insertMany(arr)
      }

      return arr
    },
    addRewardImport: async (root, { reward }) => {
      const { ...rest } = reward
      return await Reward.findOneAndUpdate({ exchangeId: reward.exchangeId }, { $setOnInsert: { ...rest } }, { upsert: true })
    },
    updateChecking: async (root, { checking }) => {
      return await Checking.findByIdAndUpdate(checking.id, checking, { new: true })
    },
    addInterest: async (root, { interest }) => {
      const { ...rest } = interest
      const newInterest = new Interest({ ...rest })
      
      return await newInterest.save()
    },
    deleteInterest: async (root, { id }) => {
      return await Interest.findByIdAndDelete(id)
    },
    deleteChecking: async (root, { id }) => {
      return await Checking.findByIdAndDelete(id)
    },
    updateInterest: async (root, { interest }) => {
      return await Interest.findByIdAndUpdate(interest.id, interest, { new: true })
    },
    addTrx: async (root, { trx }) => {
      const { ...rest } = trx
      return await Trx.findOneAndUpdate({ exchangeId: trx.exchangeId }, { $setOnInsert: { ...rest } }, { upsert: true })
    },
    updateTrx: async (root, { trx }) => {
      return await Trx.findByIdAndUpdate(trx.id, trx, { new: true })
    },
    addTaxImport: async (root, { tax }) => {
      const { ...rest } = tax
      let taxExist = await Tax.findOne({ exchangeId: tax.exchangeId })
      if(!taxExist) {
        const newTax = new Tax({ ...rest })
        return await newTax.save()
      }
    },
    addTax: async (root, { tax }) => {
      const { ...rest } = tax
      const newTax = new Tax({ ...rest })
      return await newTax.save()
    },
    addInvestmentImport: async (root, { investment }) => {
      const { ...rest } = investment
      let investmentExist = await Investment.findOne({ exchangeId: investment.exchangeId })
      if(!investmentExist) {
        const newInvestment = new Investment({ ...rest })
        return await newInvestment.save()
      }
    },
    addInvestment: async (root, { investment }) => {
      const { ...rest } = investment
      const newInvestment = new Investment({ ...rest })
      return await newInvestment.save()
    },
    updateTax: async (root, { tax }) => {
      return await Tax.findByIdAndUpdate(tax.id, tax, { new: true })
    },
    delReward: async (root, { req }) => {
      const { ...rest } = req
      return await Tax.deleteMany({ exchange: "Celsius" })
    }
  },
}

function getDateAsUtc(d) {
  let n = new Date(d)
  return new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())
}