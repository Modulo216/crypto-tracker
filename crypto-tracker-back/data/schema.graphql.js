import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type Liquidation {
    id: ID
    taxable: Boolean
    event: String
    usdAmount: Float
    updatedAt: DateTime
    updatedAtView: String
    newCoin: String
    newCoinAmount: Float
    coin: String
    coinAmount: Float
    coinValue: Float
    coinUpdatedAt: DateTime
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
    updatedAt: DateTime
    updatedAtView: String
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
  type Checking {
    id: ID
    date: DateTime
    dateView: String
    amount: Float
    type: String
  }
  input CheckingInput {
    id: ID
    date: DateTime
    dateView: String
    amount: Float
    type: String
  }
  type Reward {
    id: ID
    exchange: String
    exchangeId: String
    coin: String
    updatedAt: DateTime
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
    updatedAt: DateTime
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
    updatedAt: DateTime
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
    updatedAt: DateTime
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
    updatedAt: DateTime
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
    updatedAt: DateTime
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
    updatedAt: DateTime
    amount: Float
    merchant: String
    title: String
    subtitle: String
    category: String
    cashRewardRate: Float
  }
  input TrxInput {
    id: ID
    exchange: String
    exchangeId: String
    trxType: String
    updatedAt: DateTime
    amount: Float
    merchant: String
    title: String
    subtitle: String
    category: String
    cashRewardRate: Float
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
    findPHistory(pHistory: PHistoryInput): [PHistory]
    getInvestments: [Investment]
    getRewards: [Reward]
    getLiquidation: [Liquidation]
    getPHistory: [PHistory]
  }
  type Mutation {
    addLiquidation(liquidation: LiquidationInput): Liquidation
    addChecking(checking: CheckingInput): Checking
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
    delReward(id: ID): Reward
  }
`