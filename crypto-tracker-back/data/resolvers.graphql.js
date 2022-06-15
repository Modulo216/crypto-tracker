import { Interest, Trx } from "../db/dbConnector.js"

export const resolvers = {
  Query: {
    getInterests: async (root) => {
      return await Interest.find()
    },
    findInterests: async (root, { interest }) => {
      return await Interest.find({ nickName: interest.nickName })
    },
    getTrxs: async (root) => {
      return await Trx.find()
    },
  },
  Mutation: {
    addInterest: async (root, { interest }) => {
      const { ...rest } = interest
      const newInterest = new Interest({ ...rest })

      return await newInterest.save()
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