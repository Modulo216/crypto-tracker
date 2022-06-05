import { Interest } from "../db/dbConnector.js"

export const resolvers = {
  Query: {
    getInterests: async (root) => {
      return await Interest.find()
    },
    findInterests: async (root, { interest }) => {
      return await Interest.find({ nickName: interest.nickName })
    },
  },
  Mutation: {
    addInterest: async (root, { interest }) => {
      const { ...rest } = interest
      const newInterest = new Interest({ ...rest })

      return newInterest.save()
    }
  },
}