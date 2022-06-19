import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type Checking {
    id: ID
    date: String
    amount: String
    type: String
  }
  input CheckingInput {
    id: ID
    date: String
    amount: String
    type: String
  }
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
    getChecking: [Checking]
  }
  type Mutation {
    addChecking(checking: CheckingInput): Checking
    updateChecking(checking: CheckingInput): Checking
    addInterest(interest: InterestInput): Interest
    updateInterest(interest: InterestInput): Interest
    deleteInterest(id: ID): Interest
    deleteChecking(id: ID): Checking
    addTrx(trx: TrxInput): Trx
    updateTrx(trx: TrxInput): Trx
  }
`