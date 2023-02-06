import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type Liquidation {
    id: ID
    taxable: Boolean
    event: String
    usdAmount: Float
    updatedAt: String
    newCoin: String
    newCoinAmount: Float
    coin: String
    coinAmount: Float
    coinValue: Float
    coinUpdatedAt: String
    taxes: [Tax]
    rewards: [Reward]
    investments: [Investment]
    liquidations: [Liquidation]
    liquidation: Liquidation
  }
  input LiquidationInput {
    id: ID
    taxable: Boolean
    event: String
    usdAmount: Float
    updatedAt: String
    newCoin: String
    newCoinAmount: Float
    taxes: [ID]
    rewards: [ID]
    investments: [ID]
    liquidations: [ID]
  }
  type CoinPrice {
    coin: String
    price: Float
  }
  input CoinPriceInput {
    coin: String
    price: Float
  }
  type PHistory {
    id: ID
    updatedAt: Date
    prices: [CoinPrice]
  }
  input PHistoryInput {
    updatedAt: Date
    prices: [CoinPriceInput]
  }
  type PriceHistory {
    id: ID
    date: String
    coin: String
    price: String
  }
  input PriceHistoryInput {
    id: ID
    date: String
    coin: String
    price: String
  }
  type Checking {
    id: ID
    date: String
    amount: Float
    type: String
  }
  input CheckingInput {
    id: ID
    date: String
    amount: Float
    type: String
  }
  type Reward {
    id: ID
    exchange: String
    exchangeId: String
    coin: String
    updatedAt: String
    amount: Float
    value: Float
    title: String
    subtitle: String
    liquidation: Liquidation
  }
  input RewardInput {
    id: ID
    exchange: String
    exchangeId: String
    coin: String
    updatedAt: String
    amount: Float
    value: Float
    title: String
    subtitle: String
  }
  type Tax {
    id: ID
    exchange: String
    exchangeId: String
    coin: String
    updatedAt: String
    amount: Float
    value: Float
    title: String
    subtitle: String
    activity: String
    liquidation: Liquidation
  }
  input TaxInput {
    id: ID
    exchange: String
    exchangeId: String
    coin: String
    updatedAt: String
    amount: Float
    value: Float
    title: String
    subtitle: String
    activity: String
  }
  type Investment {
    id: ID
    exchangeId: String
    coin: String
    updatedAt: String
    amount: Float
    spent: Float
    title: String
    subtitle: String
    investType: String
    fillPrice: Float
    value: String
    liquidation: Liquidation
  }
  input InvestmentInput {
    id: ID
    exchangeId: String
    coin: String
    updatedAt: String
    amount: Float
    spent: Float
    title: String
    subtitle: String
    investType: String
    fillPrice: Float
    value: String
  }
  type Trx {
    id: ID
    exchange: String
    exchangeId: String
    trxType: String
    updatedAt: String
    amount: Float
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
    amount: Float
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
    isTax: Boolean
    isReward: Boolean
  }
  input InterestInput {
    id: ID
    nickName: String
    name: String
    currencyPair: String
    cbaseWalletId: String
    wallet: String
    isTax: Boolean
    isReward: Boolean
  }
  type Query {
    getInterests: [Interest]
    findInterest(interest: InterestInput): Interest
    getTrxs: [Trx]
    getChecking: [Checking]
    taxExists: Int
    trxExists: Int
    rewardExists: Int
    getTaxes: [Tax]
    findPriceHistory(priceHistory: PriceHistoryInput): PriceHistory
    findPHistory(pHistory: PHistoryInput): [PHistory]
    getInvestments: [Investment]
    getRewards: [Reward]
    getPriceHistory: [PriceHistory]
    getLiquidation: [Liquidation]
    getPHistory: [PHistory]
  }
  type Mutation {
    addLiquidation(liquidation: LiquidationInput): Liquidation
    addChecking(checking: CheckingInput): Checking
    addPriceHistory(priceHistory: PriceHistoryInput): PriceHistory
    addPriceHistoryMany(priceHistories: [[Float]]): ID
    addPHistoryMany(pHistory: [[Float]]): ID
    updateChecking(checking: CheckingInput): Checking
    addInterest(interest: InterestInput): Interest
    updateInterest(interest: InterestInput): Interest
    deleteInterest(id: ID): Interest
    deleteChecking(id: ID): Checking
    addTrx(trx: TrxInput): Trx
    updateTrx(trx: TrxInput): Trx
    addTax(tax: TaxInput): Tax
    addRewardImport(reward: RewardInput): Reward
    addTaxImport(tax: TaxInput): Tax
    addInvestment(investment: InvestmentInput): Investment
    addInvestmentImport(investment: InvestmentInput): Investment
    updateTax(tax: TaxInput): Tax
    deletePriceHistoryMany(interest: InterestInput!): Int
    delReward(id: ID): Reward
  }
`