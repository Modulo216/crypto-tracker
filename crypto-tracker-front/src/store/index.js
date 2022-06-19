import Vue from 'vue'
import Vuex from 'vuex'
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';

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

export default new Vuex.Store({
  state: {
  },
  getters: {
    getMonthNames() {
      return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    getUtcMonth: state => dateString => {
      const date = parseISO(dateString);
      const dateWithOffset = adjustForUTCOffset(date)
      return dateWithOffset.getMonth()
    },
    getUtcDate: state => dateString => {
      const date = parseISO(dateString);
      return adjustForUTCOffset(date)
    }
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
