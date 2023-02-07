import { Interest, Trx, Checking, Tax, Reward, Investment, Liquidation, PHistory } from "../db/dbConnector.js"
const { isBefore } = require('date-fns')
const formatISO = require('date-fns/formatISO')

export const resolvers = {
  Query: {
    getInterests: async (root, query) => {
      return await Interest.find({...query}).sort({ name: 1 })
    },
    findInterest: async (root, { interest }) => {
      return await Interest.findOne({ name: interest.name })
    },
    findPHistory: async (root, query) => {
      return await PHistory.findOne({...query}).lean()
    },
    getTrxs: async (root) => {
      let trxs = await Trx.find()
      trxs.sort((d1, d2) => new Date(d1.updatedAt).getTime() - new Date(d2.updatedAt).getTime())
      return trxs
    },
    getChecking: async (root) => {
      return await Checking.find()
    },
    taxExists: async (root) => {
      let taxes = await Tax.find().lean()
      return taxes.length
    },
    trxExists: async (root) => {
      let trxs = await Trx.find().lean()
      return trxs.length
    },
    rewardExists: async (root) => {
      let rewards = await Reward.find().lean()
      return rewards.length
    },
    getTaxes: async (root) => {
      let taxes = await Tax.find().populate('liquidation')
      taxes.sort((d1, d2) => new Date(d1.updatedAt).getTime() - new Date(d2.updatedAt).getTime())
      
      return taxes
    },
    getInvestments: async (root) => {
      let investments = await Investment.find().populate('liquidation')
      investments.sort((d1, d2) => new Date(d1.updatedAt).getTime() - new Date(d2.updatedAt).getTime())
      
      return investments
    },
    getRewards: async (root) => {
      let rewards = await Reward.find().populate('liquidation')
      rewards.sort((d1, d2) => new Date(d1.updatedAt).getTime() - new Date(d2.updatedAt).getTime())
      
      return rewards
    },
    getLiquidation: async (root) => {
      // Array of Rewards, Taxes, Investment, Liquidation
      let liqus = await Liquidation.find().populate('rewards').populate('taxes').populate('investments').populate('liquidations').populate('liquidation')
      liqus.sort((d1, d2) => new Date(d1.updatedAt).getTime() - new Date(d2.updatedAt).getTime())
      return liqus
    },
    getPHistory: async (root) => {
      let history = await PHistory.find().lean()
      history.sort((d1, d2) => d1.updatedAt.getTime() - d2.updatedAt.getTime())

      return history
    }
  },
  Mutation: {
    addLiquidation: async (root, { liquidation }) => {
      const { ...rest } = liquidation
      const newLiquidation = new Liquidation({ ...rest })
      const liqu = await newLiquidation.save()

      newLiquidation.taxes.forEach(async id => {
        const tax = await Tax.findById(id)
        tax.liquidation = liqu.id
        tax.save()
      })
      
      newLiquidation.rewards.forEach(async id => {
        const reward = await Reward.findById(id)
        reward.liquidation = liqu.id
        reward.save()
      })

      newLiquidation.investments.forEach(async id => {
        const investment = await Investment.findById(id)
        investment.liquidation = liqu.id
        investment.save()
      })

      newLiquidation.liquidations.forEach(async id => {
        const liq = await Liquidation.findById(id)
        liq.liquidation = liqu.id
        liq.save()
      })

      await liqu.populate('rewards')
      await liqu.populate('taxes')
      await liqu.populate('investments')
      await liqu.populate('liquidations')

      return liqu
    },
    addChecking: async (root, { checking }) => {
      const { ...rest } = checking
      const newChecking = new Checking({ ...rest })
      
      return await newChecking.save()
    },
    addPHistoryMany: (root, arr) => {  
      if(arr.length > 0) {
        PHistory.insertMany(arr)
      }
    },
    addRewardImport: async (root, { reward }) => {
      const { ...rest } = reward
      return await Reward.findOneAndUpdate({ exchangeId: reward.exchangeId }, { $setOnInsert: { ...rest } }, { upsert: true })
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
      if(interest.nickName === '') {
        let phistories = await PHistory.find({ "prices.coin": interest.name })
        console.log("REMOVING PHISTORYY " + phistories.length)
        phistories.forEach(ph => {
          ph.prices.splice(ph.prices.findIndex(p => p.coin === interest.name), 1)
          ph.save()
        })
      }
      return await Interest.findByIdAndUpdate(interest.id, interest, { new: true })
    },
    addTrx: async (root, { trx }) => {
      const { ...rest } = trx
      return await Trx.findOneAndUpdate({ exchangeId: trx.exchangeId }, { $setOnInsert: { ...rest } }, { upsert: true })
    },
    updateTrx: async (root, { trx }) => {
      return await Trx.findOneAndUpdate({ exchangeId: trx.exchangeId }, trx)
    },
    addTaxImport: async (root, { tax }) => {
      const { ...rest } = tax
      return await Tax.findOneAndUpdate({ exchangeId: tax.exchangeId }, { $setOnInsert: { ...rest } }, { upsert: true })
    },
    addTax: async (root, { tax }) => {
      const { ...rest } = tax
      const newTax = new Tax({ ...rest })
      return await newTax.save()
    },
    addInvestmentImport: async (root, { investment }) => {
      const { ...rest } = investment
      return await Investment.findOneAndUpdate({ exchangeId: investment.exchangeId }, { $setOnInsert: { ...rest } }, { upsert: true })
    },
    addInvestment: async (root, { investment }) => {
      const { ...rest } = investment
      const newInvestment = new Investment({ ...rest })
      return await newInvestment.save()
    },
    updateTax: async (root, { tax }) => {
      return await Tax.findByIdAndUpdate(tax.id, tax, { new: true })
    },
    delReward: async (root, { req }) => {
      const { ...rest } = req
      //return await Investment.deleteMany({ coin: "BTC", updatedAt: /2022-04/i })
    }
  },
}

function getDateAsUtc(d) {
  let n = new Date(d)
  return new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())
}