import Vue from 'vue'
import Vuex from 'vuex'
import parseISO from 'date-fns/parseISO';
import { getInterests, getRewards, getTaxes, getInvestments, getLiquidation } from '../api/apollo'

Vue.use(Vuex)

const adjustForUTCOffset = date => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
}

const _categories = ['Auto + Gas','Cable + Phone','Merchandise','Entertainment','Gifts','Groceries','Healthcare',
  'Insurance','Other','Personal + Family','Pets','Rent','Restaurants','Services + Supplies','Utilities']

const _monthNames = ['Jan', 'Feb', "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]

export default new Vuex.Store({
  state: {
    homeCoinsSum: [],
    interests: [],
    allRewards: [],
    allTaxes: [],
    allInvestments: [],
    allLiquidation: [],
    historyChartData: [],
    spendingTrxs: [],
    spendingChecking: []
  },
  getters: {
    getMonthNames() {
      return _monthNames
    },
    getUtcMonth: state => dateString => {
      const date = parseISO(dateString);
      return date.getMonth()
    },
    getUtcDate: state => dateString => {
      const date = parseISO(dateString);
      return adjustForUTCOffset(date)
    },
    getCategories() {
      return _categories
    }
  },
  mutations: {
    updateCoinsSum(state, { item }) {
      const itemId = state.homeCoinsSum.findIndex(c => c.coin === item.coin)
      if(itemId === -1) {
        item.oldPrice = item.price
        state.homeCoinsSum.push(item)
      } else {
        state.homeCoinsSum[itemId].oldPrice = state.homeCoinsSum[itemId].price
        state.homeCoinsSum[itemId].value = item.value
        state.homeCoinsSum[itemId].price = item.price
        state.homeCoinsSum[itemId].spent = item.spent
        state.homeCoinsSum[itemId].amount = item.amount
      }
    },
    removeCoinsSum(state, coin) {
      state.homeCoinsSum.splice(state.homeCoinsSum.findIndex(i => i.coin === coin), 1)
    },
    setSpending(state, {trxs, checking}) {
      state.spendingTrxs = trxs
      state.spendingChecking = checking
    },
    addspendingChecking(state, item) {
      state.spendingChecking.push(item)
    },
    removeSpendingChecking(state, itemId) {
      state.spendingChecking.splice(state.spendingChecking.findIndex(i => i.id === itemId), 1)
    },
    addTrxs(state, items) {
      state.spendingTrxs.push(...items)
    },
    updateTrxs(state, item) {
      let indexOf = state.spendingTrxs.findIndex(i => i.exchangeId === item.exchangeId)
      Object.assign(state.spendingTrxs[indexOf], item)
    },
    setInterests(state, items) {
      state.interests = items
    },
    removeInterest(state, itemId) {
      state.interests.splice(state.interests.findIndex(i => i.id === itemId), 1)
    },
    addInterest(state, item) {
      state.interests.push(item)
    },
    updatedInterest(state, item) {
      let indexOf = state.interests.findIndex(i => i.id === item.id)
      Object.assign(state.interests[indexOf], item)
    },
    setChartHistory(state, items) {
      state.historyChartData = items
    },
    setRewards(state, items) {
      state.allRewards = items
    },
    setTaxes(state, items) {
      state.allTaxes = items
    },
    addTax(state, item) {
      state.allTaxes.push(item)
    },
    addTaxMany(state, items) {
      state.allTaxes.push(...items)
    },
    addRewardMany(state, items) {
      state.allRewards.push(...items)
    },
    updatedTax(state, item) {
      let indexOf = state.allTaxes.findIndex(i => i.exchangeId === item.exchangeId)
      Object.assign(state.allTaxes[indexOf], item)
    },
    updateLiqItems(state, liq) {
      liq.taxes.forEach(item => {
        item.liquidation = liq.id
        let itemIdx = item.exchangeId ? state.allTaxes.findIndex(i => i.exchangeId === item.exchangeId) : state.allTaxes.findIndex(i => i.id === item.id)
        Vue.set(state.allTaxes, itemIdx, item)
      })

      liq.rewards.forEach(item => {
        item.liquidation = liq.id
        Vue.set(state.allRewards, state.allRewards.findIndex(i => i.exchangeId === item.exchangeId), item)
      })

      liq.investments.forEach(item => {
        item.liquidation = liq.id
        Vue.set(state.allInvestments, state.allInvestments.findIndex(i => i.id === item.id), item)
      })

      liq.liquidations.forEach(item => {
        let newItem = state.allLiquidation.find(i => i.id === item.id)
        newItem.liquidation = liq.id
        Vue.set(state.allLiquidation, state.allLiquidation.findIndex(i => i.id === item.id), newItem)
      })

      if(state.homeCoinsSum.length > 0) {
        const itemId = state.homeCoinsSum.findIndex(c => c.coin === liq.coin)
        state.homeCoinsSum[itemId].amount = state.homeCoinsSum[itemId].amount - liq.coinAmount
        state.homeCoinsSum[itemId].value = state.homeCoinsSum[itemId].amount * state.homeCoinsSum[itemId].price

        if(liq.event === 'Swap') {
          const swapCoinId = state.homeCoinsSum.findIndex(c => c.coin === liq.newCoin)
          state.homeCoinsSum[swapCoinId].amount = state.homeCoinsSum[swapCoinId].amount + parseFloat(liq.newCoinAmount)
          state.homeCoinsSum[swapCoinId].value = state.homeCoinsSum[swapCoinId].amount * state.homeCoinsSum[swapCoinId].price
        }
      }
      
      state.historyChartData = []
    },
    setInvestments(state, items) {
      state.allInvestments = items
    },
    addInvestment(state, item) {
      state.allInvestments.push(item)
    },
    addInvestments(state, items) {
      state.allInvestments.push(...items)
    },
    setLiquidation(state, items,) {
      state.allLiquidation = items
    },
    addLiquidation(state, item) {
      state.allLiquidation.push(item)
    },
  },
  actions: {
    populateInterests: (context) => getInterests().then(r => context.commit('setInterests', r)),
    populateRewards: (context) => getRewards().then(r => context.commit('setRewards', r)),
    populateTaxes: (context) => getTaxes().then(r => context.commit('setTaxes', r)),
    populateInvestments: (context) => getInvestments().then(r => context.commit('setInvestments', r)),
    populateLiquidation: (context) => getLiquidation().then(r => context.commit('setLiquidation', r))
  },
  modules: {
  }
})