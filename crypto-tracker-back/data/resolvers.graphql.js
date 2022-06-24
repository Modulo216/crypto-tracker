import { Interest, Trx, Checking } from "../db/dbConnector.js"

export const resolvers = {
  Query: {
    getInterests: async (root) => {
      return await Interest.find()
    },
    findInterest: async (root, { interest }) => {
      return await Interest.findOne({ name: interest.name })
    },
    getTrxs: async (root) => {
      return await Trx.find()
    },
    getChecking: async (root) => {
      return await Checking.find()
    }
  },
  Mutation: {
    addChecking: async (root, { checking }) => {
      const { ...rest } = checking
      const newChecking = new Checking({ ...rest })
      
      return await newChecking.save()
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
    }
  },
}