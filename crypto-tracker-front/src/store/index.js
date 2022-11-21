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
    allLiquidation: []
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
      }
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

    setRewards(state, items) {
      state.allRewards = items
    },

    setTaxes(state, items) {
      state.allTaxes = items
    },
    addTax(state, item) {
      state.allTaxes.push(item)
    },
    updatedTax(state, item) {
      let indexOf = state.allTaxes.findIndex(i => i.id === item.id)
      Object.assign(state.allTaxes[indexOf], item)
    },

    setInvestments(state, items) {
      state.allInvestments = items
    },
    addInvestment(state, item) {
      state.allInvestments.push(item)
    },
    setLiquidation(state, items,) {
      state.allLiquidation = items
    }
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