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
  type Tax {
    id: ID
    exchange: String
    exchangeId: String
    coin: String
    updatedAt: String
    amount: String
    value: String
    title: String
    subtitle: String
    activity: String
  }
  input TaxInput {
    id: ID
    exchange: String
    exchangeId: String
    coin: String
    updatedAt: String
    amount: String
    value: String
    title: String
    subtitle: String
    activity: String
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
    taxExists: Int
    trxExists: Int
    getTaxes: [Tax]
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
    addTax(tax: TaxInput): Tax
    updateTax(tax: TaxInput): Tax
  }
`