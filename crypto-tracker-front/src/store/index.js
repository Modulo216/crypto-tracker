import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  getters: {
    getMonthNames() {
      return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    }
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
