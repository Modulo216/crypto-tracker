import { Interest, Trx } from "../db/dbConnector.js"

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
    }
  },
  Mutation: {
    addInterest: async (root, { interest }) => {
      const { ...rest } = interest
      const newInterest = new Interest({ ...rest })
      
      return await newInterest.save()
    },
    deleteInterest: async (root, { id }) => {
      return await Interest.findByIdAndDelete(id)
    },
    updateInterest: async (root, { interest }) => {
      return await Interest.findByIdAndUpdate(interest.id, interest, { new: true })
    },
    addTrx: async (root, { trx }) => {
      const { ...rest } = trx
      const newTrx = new Trx({ ...rest })

      return await newTrx.save()
    },
    updateTrx: async (root, { trx }) => {
      return await Trx.findByIdAndUpdate(trx.id, trx, { new: true })
    }
  },
}