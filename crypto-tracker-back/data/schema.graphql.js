import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type Interest {
    id: ID
    nickName: String
    name: String
    currencyPair: String
    cbaseWalletId: String
    wallet: String
  }
  input InterestInput {
    nickName: String
    name: String
    currencyPair: String
    cbaseWalletId: String
    wallet: String
  }
  type Query {
    getInterests: [Interest]
    findInterests(interest: InterestInput): [Interest]
  }
  type Mutation {
    addInterest(interest: InterestInput): Interest
  }
`