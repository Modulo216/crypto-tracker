import Vue from 'vue'
import Vuex from 'vuex'
import parseISO from 'date-fns/parseISO';
import { getInterests, getRewards, getTaxes, getInvestments, getLiquidation, getStockInvestments, getStockHistory } from '../api/apollo'
import { getCoinPrice } from '../api/endpoints/coinbase'
const { formatISO } = require('date-fns')
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
    interests: [],
    stocks: [],
    allRewards: [],
    allTaxes: [],
    allInvestments: [],
    allStockInvestments: [],
    allLiquidation: [],
    historyChartData: [],
    spendingTrxs: [],
    spendingChecking: [],
    coinPrices: [],
    stockPrices: []
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
    },
    getCoinPrice: state => coinName => {
      if(state.coinPrices.length === 0) {
        return { oldPrice: 0, price: 0 }
      } else if (state.coinPrices.length === 1) {
        let coin = state.coinPrices[0].prices.find(c => c.base === coinName)
        return { oldPrice: 0, price: coin ? coin.amount : 0 }
      } else {
        let newPrices = state.coinPrices.slice(-2)[1].prices.find(c => c.base === coinName)
        let oldPrices = state.coinPrices.slice(-2)[0].prices.find(c => c.base === coinName)
        return { oldPrice: oldPrices ? oldPrices.amount : 0, price: newPrices ? newPrices.amount : 0 }
      }
    }
  },
  mutations: {
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
      for(const item of items) {
        let cloned = JSON.parse(JSON.stringify(item))
        state.spendingTrxs.push(cloned)
      }
    },
    updateTrxs(state, item) {
      let indexOf = state.spendingTrxs.findIndex(i => i.exchangeId === item.exchangeId)
      Object.assign(state.spendingTrxs[indexOf], item)
    },
    setInterests(state, items) {
      state.interests = items.filter(i => i.kind === 'Crypto')
      state.stocks = items.filter(i => i.kind === 'Stock')
    },
    removeInterest(state, itemId) {
      state.interests.splice(state.interests.findIndex(i => i.id === itemId), 1)
    },
    addInterest(state, item) {
      if(item.kind === 'Crypto') {
        state.interests.push(item)
      } else {
        state.stocks.push(item)
      }
    },
    updatedInterest(state, item) {
      let indexOf = state.interests.findIndex(i => i.id === item.id)
      Object.assign(state.interests[indexOf], item)
    },
    setChartHistory(state, items) {
      state.historyChartData = items
    },
    addChartHistory(state, items) {
      for (const item of items) {
        state.historyChartData.push(item)
      }
    },
    setChartHistoryTransient(state, items) {
      if(state.coinPrices.length > 0) {
        let newItem = { date: formatISO(new Date()).slice(0, 10), transient: true, coins: [] }
        for (const item of items) {
          let coinSum = item.reward + item.tax + item.invest + item.liq
          let coin = { coin: item.coin, coinSum, value: coinSum * item.price }
          newItem.coins.push(coin)
        }
        
        let itemId = state.historyChartData.findIndex(h => h.transient === true)
        if(itemId === -1) {
          state.historyChartData.push(newItem)
        } else {
          Vue.set(state.historyChartData, itemId, newItem)
        }
      }
    },
    rmChartHistoryTransient(state) {
      let itemId = state.historyChartData.findIndex(h => h.transient === true)
      if(itemId !== -1) {
        state.historyChartData.splice(itemId, 1)
      }
    },
    setRewards(state, items) {
      state.allRewards = items
    },
    setStockHistory(state, items) {
      state.stockPrices = items
    },
    addStockHistory(state, item) {
      state.stockPrices.push(item)
    },
    addStockHistoryMany(state, items) {
      if(items.length > 0) {
        state.stockPrices.push(...items)
      }
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
        Vue.set(state.allTaxes, state.allTaxes.findIndex(i => i.exchangeId === item.exchangeId), item)
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
      
      state.historyChartData = []
    },
    setInvestments(state, items) {
      state.allInvestments = items
    },
    setStockInvestments(state, items) {
      state.allStockInvestments = items
    },
    addInvestment(state, item) {
      state.allInvestments.push(item)
    },
    addStockInvestment(state, item) {
      state.allStockInvestments.push(item)
    },
    addInvestments(state, items) {
      state.allInvestments.push(...items)
    },
    setLiquidation(state, items,) {
      state.allLiquidation = items
    },
    addLiquidation(state, item) {
      item.liquidation = null
      state.allLiquidation.push(item)
    }
  },
  actions: {
    populateInterests: (context) => getInterests().then(r => context.commit('setInterests', r)),
    populateRewards: (context) => getRewards().then(r => context.commit('setRewards', r)),
    populateTaxes: (context) => getTaxes().then(r => context.commit('setTaxes', r)),
    populateInvestments: (context) => getInvestments().then(r => context.commit('setInvestments', r)),
    populateStockInvestments: (context) => getStockInvestments().then(r => context.commit('setStockInvestments', r)),
    populateLiquidation: (context) => getLiquidation().then(r => context.commit('setLiquidation', r)),
    populateStockHistory: (context) => getStockHistory().then(r => context.commit('setStockHistory', r)),
    async getCoinPrice({ commit, state, getters }, coinName) {
      let latest = state.coinPrices.slice(-1)
      if(latest.length === 0 || (new Date() - latest[0].updatedAt) > (30*1000)) {
        let retPrices = await getCoinPrice(state.interests.filter(r => r.nickName !== '').map(r => r.name))
        let obj = { updatedAt: new Date(), prices: [] }
        for (const item of retPrices.data) {
          item.amount = parseFloat(item.amount)
          obj.prices.push(item)
        }
        state.coinPrices.push(obj)
        return {oldPrice: latest.length === 0 ? 0 : latest[0].prices.find(c => c.base === coinName).amount, 
                price: retPrices.data.find(c => c.base === coinName).amount}
      } else {
        return getters.getCoinPrice(coinName)
      }
    }
  },
  modules: {
  }
})