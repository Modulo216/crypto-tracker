<template>
  <v-container fluid>
    <v-row>
      <v-col cols="9">
        <v-data-table dark dense :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :headers="headers" :items="liquidations" item-key="id" class="elevation-10" hide-default-footer disable-pagination>
          <template v-slot:[`item.updatedAt`]="{ item }">
            <span>{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template v-slot:[`item.coin`]="{ item }">
            <span v-if="item.event === 'Swap'">{{ item.liquid[0].coin }} -> {{ item.newCoin }}</span>
            <span v-if="item.event === 'Sell'">{{ item.liquid[0].coin }} -> $$$</span>
          </template>
          <template v-slot:[`item.newCoinAmount`]="{ item }">
            <span v-if="item.event === 'Swap'">{{ item.newCoinAmount }}</span>
            <span v-if="item.event === 'Sell'">{{ getAsCurrency(parseFloat(item.usdAmount)) }}</span>
          </template>
          <template v-slot:[`item.days`]="{ item }">
            <span>{{ differenceInDays($store.getters.getUtcDate(item.updatedAt), new Date(item.liquid[0].updatedAt)) }}</span>
          </template>
          <template v-slot:[`item.usdAmount`]="{ item }">
            <span>{{ getAsCurrency(parseFloat(item.usdAmount)) }}</span>
          </template>
          <template v-slot:[`item.profit`]="{ item }">
            <div class="px-3 py-1 black--text rounded text-center" :style="`width:70px;background-color: ${ getGainLoss(item) > 0 ? '#4CAF50' : getGainLoss(item) === 0 ? '#FAFAFA' : '#F44336' }`">
              {{ getAsCurrency(getGainLoss(item)) }}
            </div>
          </template>
        </v-data-table>
      </v-col>
      <v-col cols="3">
        <v-row>
          <v-col lg="12" sm="12">
            <v-data-table
              dark
              hide-default-footer
              dense
              disable-pagination
              :headers="[{ text: 'Coin', value: 'coin' },{ text: 'Amount', value: 'amount' },{ text: 'Value', value: 'value' },{ text: 'Profit', value: 'origValue' }]"
              :items="swapData"
              item-key="coin"
              class="elevation-10">
              <template v-slot:[`item.value`]="{ item }">
                <span>{{ getAsCurrency(item.value) }}</span>
              </template>
              <template v-slot:[`item.origValue`]="{ item }">
                <span>{{ (((item.value - item.origValue) / item.origValue) * 100).toFixed(2) }}%</span>
              </template>
            </v-data-table>
          </v-col>
          <v-col lg="12" sm="12" class="mt-1">
            <v-data-table
              dark
              hide-default-footer
              dense
              disable-pagination
              :headers="[{ text: 'Year', value: 'year' },{ text: 'Short', value: 'shortTerm' },{ text: 'Long', value: 'longTerm' },{ text: '$$$', value: 'dollars' }]"
              :items="sellData"
              item-key="year"
              class="elevation-10" />
          </v-col>
        </v-row>               
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { differenceInDays, differenceInYears } from 'date-fns'
export default {
  data: () => ({
    sortBy: 'updatedAt',
    sortDesc: true,
    swapData: [],
    sellData: [],
    headers: [
      { text: 'Updated At', sortable: true, value: 'updatedAt' },
      { text: 'Source', sortable: false, value: 'model_type' },
      { text: 'Event', sortable: false, value: 'event' },
      { text: 'Coin', sortable: false, value: 'coin' },
      { text: 'Days', sortable: false, value: 'days' },
      { text: 'Amount', sortable: false, value: 'newCoinAmount' },
      { text: 'USD', sortable: false, value: 'usdAmount' },
      { text: 'Gain / Loss', sortable: false, value: 'profit' }
    ],
  }),
  async created() {
    if(this.liquidations.length > 0) {
      this.createTables()
    }
  },
  watch: {
    liquidations(newVal) {
      this.createTables()
    }
  },
  computed: {
    liquidations() {
      return this.$store.state.allLiquidation
    },
  },
  methods: {
    createTables() {
      new Set(this.liquidations.filter(l => l.newCoin !== undefined).map(l => l.newCoin)).forEach(c => {
        let coinCookie = $cookies.get(c) || 0
        let amount = this.liquidations.filter(t => t.event === 'Swap' && t.newCoin === c).map(item => parseFloat(item.newCoinAmount)).reduce((prev, next) => prev + next, 0)
        let origValue = this.liquidations.filter(t => t.event === 'Swap' && t.newCoin === c).map(item => item.liquid).flat().map(item => parseFloat(item.value)).reduce((prev, next) => prev + next, 0)
        this.swapData.push( { coin: c, amount: amount.toFixed(8), value: amount * coinCookie, origValue: origValue } )
      })
      let amount = this.liquidations.filter(t => t.event === 'Sell').map(item => parseFloat(item.usdAmount)).reduce((prev, next) => prev + next, 0)
      this.swapData.push( { coin: '$$$', amount: amount.toFixed(2), value: amount, origValue: amount } )

      new Set(this.liquidations.map(l => l.updatedAt.substring(0,4))).forEach(c => {
        let shortTerm = this.liquidations.filter(t => t.updatedAt.substring(0,4) === c && Math.abs(differenceInYears(new Date(t.updatedAt), new Date(t.liquid[0].updatedAt))) === 0).map(item => parseFloat(item.usdAmount)).reduce((prev, next) => prev + next, 0) -
          this.liquidations.filter(t => t.updatedAt.substring(0,4) === c && Math.abs(differenceInYears(new Date(t.updatedAt), new Date(t.liquid[0].updatedAt))) === 0).map(item => item.liquid).flat().map(item => parseFloat(item.value)).reduce((prev, next) => prev + next, 0) 
        let longTerm = this.liquidations.filter(t => t.updatedAt.substring(0,4) === c && Math.abs(differenceInYears(new Date(t.updatedAt), new Date(t.liquid[0].updatedAt))) >= 1).map(item => parseFloat(item.usdAmount)).reduce((prev, next) => prev + next, 0) -
          this.liquidations.filter(t => t.updatedAt.substring(0,4) === c && Math.abs(differenceInYears(new Date(t.updatedAt), new Date(t.liquid[0].updatedAt))) >= 1).map(item => item.liquid).flat().map(item => parseFloat(item.value)).reduce((prev, next) => prev + next, 0)
        
        let dollars = this.liquidations.filter(t => t.updatedAt.substring(0,4) === c && t.event === 'Sell').map(item => parseFloat(item.usdAmount)).reduce((prev, next) => prev + next, 0)

        this.sellData.push({ year: c, shortTerm: this.getAsCurrency(shortTerm), longTerm: this.getAsCurrency(longTerm), dollars: this.getAsCurrency(dollars) })
      })
    },
    formatDate(d) {
      let theDate = new Date(d)
      return ("0" + (theDate.getUTCMonth() + 1)).slice(-2) + '/' + ("0" + theDate.getUTCDate()).slice(-2) +
        '/' + theDate.getUTCFullYear().toString().slice(-2)
    },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    getGainLoss(item) {
      return parseFloat(item.usdAmount) - item.liquid.map(i => parseFloat(i.value)).reduce((prev, next) => prev + next, 0)
    }, differenceInDays
  }
}
</script>