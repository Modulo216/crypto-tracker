<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <month-picker :trxs="liquidations" @monthClick="onMonthClick" />
      </v-col>
      <v-col cols="6">
        <v-data-table dark dense :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :headers="headers" :items="liquidations" item-key="id" class="elevation-10" hide-default-footer disable-pagination>
          <template v-slot:[`item.updatedAt`]="{ item }">
            <span>{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template v-slot:[`item.coin`]="{ item }">
            <span>{{ item.liquid[0].coin }} -> {{ item.newCoin }}</span>
          </template>
          <template v-slot:[`item.profit`]="{ item }">
            <span class="px-3 py-1 black--text rounded text-center" :style="`background-color: ${ getGainLoss(item) > 0 ? '#4CAF50' : getGainLoss(item) === 0 ? '#FAFAFA' : '#F44336' }`">
              {{ getAsCurrency(getGainLoss(item)) }}
            </span>
          </template>
        </v-data-table>
      </v-col>
      <v-col cols="5">

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import MonthPicker from '../components/shared/MonthPicker'
import { getCoinPrice } from '../api/endpoints/coinbase'
const { isBefore, isSameDay } = require('date-fns')
export default {
  components: {
    MonthPicker
  },
  data: () => ({
    sortBy: 'updatedAt',
    sortDesc: true,
    headers: [
      { text: 'Updated At', sortable: true, value: 'updatedAt' },
      { text: 'Event', sortable: false, value: 'event' },
      { text: 'Coin', sortable: false, value: 'coin' },
      { text: 'Gain / Loss', sortable: false, value: 'profit' }
    ],
  }),
  async created() {

  },
  computed: {
    liquidations() {
      return this.$store.state.allLiquidation
    },
  },
  methods: {
    onMonthClick(dateMonth) {

    },
    formatDate(d) {
      let theDate = new Date(d)
      return ("0" + (theDate.getMonth() + 1)).slice(-2) + '/' + ("0" + theDate.getDate()).slice(-2) +
        '/' + theDate.getFullYear().toString().slice(-2)
    },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    getGainLoss(item) {
      return parseFloat(item.usdAmount) - item.liquid.map(i => parseFloat(i.value)).reduce((prev, next) => prev + next, 0)
    }
  }
}
</script>