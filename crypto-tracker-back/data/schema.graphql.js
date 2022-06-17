import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type Trx {
    id: ID
    exchange: String
    exchangeId: String
    trxType: String
    updatedAt: String
    amount: String
    merchant: String
    title: String
    subtitle: String
    category: String
  }
  input TrxInput {
    id: ID
    exchange: String
    exchangeId: String
    trxType: String
    updatedAt: String
    amount: String
    merchant: String
    title: String
    subtitle: String
    category: String
  }
  type Interest {
    id: ID
    nickName: String
    name: String
    currencyPair: String
    cbaseWalletId: String
    wallet: String
  }
  input InterestInput {
    id: ID
    nickName: String
    name: String
    currencyPair: String
    cbaseWalletId: String
    wallet: String
  }
  type Query {
    getInterests: [Interest]
    findInterest(interest: InterestInput): Interest
    getTrxs: [Trx]
  }
  type Mutation {
    addInterest(interest: InterestInput): Interest
    updateInterest(interest: InterestInput): Interest
    deleteInterest(id: ID): Interest
    addTrx(trx: TrxInput): Trx
    updateTrx(trx: TrxInput): Trx
  }
`