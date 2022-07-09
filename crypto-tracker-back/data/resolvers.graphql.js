import { Interest, Trx, Checking, Tax, Reward } from "../db/dbConnector.js"

export const resolvers = {
  Query: {
    getInterests: async (root, query) => {
      return await Interest.find({...query})
    },
    findInterest: async (root, { interest }) => {
      return await Interest.findOne({ name: interest.name })
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
    getRewards: async (root) => {
      let rewards = await Reward.find()
      rewards.sort((d1, d2) => new Date(d1.updatedAt).getTime() - new Date(d2.updatedAt).getTime())
      
      return rewards
    }
  },
  Mutation: {
    addChecking: async (root, { checking }) => {
      const { ...rest } = checking
      const newChecking = new Checking({ ...rest })
      
      return await newChecking.save()
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
    updateTax: async (root, { tax }) => {
      return await Tax.findByIdAndUpdate(tax.id, tax, { new: true })
    },
  },
}