<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <month-picker :trxs="allTaxes" @monthClick="onMonthClick" />
      </v-col>
      <v-col cols="7">
        <taxes-table :taxes="taxes" :activities="allTaxes.map(t => t.activity)" :coins="allTaxes.map(t => t.coin)" :exchanges="allTaxes.map(t => t.exchange)"
          :monthNameActive="monthNameActive" @taxUpdated="onTaxUpdated" @taxAdded="onTaxAdded" @refreshTax="onRefreshTax" />
      </v-col>
      <v-col cols="4">
        <v-row no-gutters class="pt-1">
          <v-expansion-panels accordion dark multiple v-model="panel">
            <v-expansion-panel v-model="panel">
              <v-expansion-panel-header>Summary</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row no-gutters>
                  <v-col lg="6" sm="12" class="pa-1">
                    <v-data-table
                      @click:row="rowClick"
                      single-select
                      dark
                      hide-default-footer
                      dense
                      disable-pagination
                      :headers="[{ text: 'Activity', value: 'activity' },{ text: 'Sum', value: 'sum' }]"
                      :items="activitySum"
                      item-key="activity"
                      class="elevation-10 row-pointer">
                      <template v-slot:[`item.sum`]="{ item }">
                        <span>{{ getAsCurrency(item.sum) }}</span>
                      </template>
                    </v-data-table>
                  </v-col>
                  <v-col lg="6" sm="12" class="pa-1">
                    <v-data-table
                      @click:row="rowClick"
                      single-select
                      dark
                      hide-default-footer
                      dense
                      disable-pagination
                      :headers="[{ text: 'Exchange', value: 'exchange' },{ text: 'Sum', value: 'sum' }]"
                      :items="exchangeSum"
                      item-key="exchange"
                      class="elevation-10 row-pointer">
                      <template v-slot:[`item.sum`]="{ item }">
                        <span>{{ getAsCurrency(item.sum) }}</span>
                      </template>
                    </v-data-table>
                    <v-card class="my-2" dark>
                      <v-card-text class="subtitle-1 pa-3 d-flex">
                        <div style="flex: 0 0 50%;">Tax: <span class="red--text">{{ getAsCurrency(taxes.map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0)) }}</span></div>
                        <div>Val: <span class="green--text">{{ getAsCurrency(coinsSum.map(t => parseFloat(t.val)).reduce((prev, next) => prev + next, 0)) }}</span></div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col lg="12" sm="12" class="pa-1">
                    <v-data-table
                      @click:row="rowClick"
                      single-select
                      dark
                      hide-default-footer
                      dense
                      disable-pagination
                      :headers="[{ text: 'Coin', value: 'coin' },{ text: 'Amount', value: 'amount' },{ text: 'Sum', value: 'sum' },{ text: 'Value', value: 'val' }]"
                      :items="coinsSum"
                      item-key="coin"
                      class="elevation-10 row-pointer">
                      <template v-slot:[`item.amount`]="{ item }">
                        <span>{{ Number((item.amount).toFixed(8)) }}</span>
                      </template>
                      <template v-slot:[`item.sum`]="{ item }">
                        <span>{{ getAsCurrency(item.sum) }}</span>
                      </template>
                      <template v-slot:[`item.val`]="{ item }">
                        <span>{{ getAsCurrency(item.val) }}</span>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-col lg="12">
            <bar :allTaxes="allTaxes" class="mt-2" />
          </v-col>
          <v-col lg="12">
            <line-chart :allRewards="allTaxes" class="mt-2" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import MonthPicker from '../components/shared/MonthPicker'
import TaxesTable from '../components/taxes/TaxesTable.vue'
import Bar from '../components/taxes/charts/Bar'
import Line from '../components/taxes/charts/Line'
import { refreshTaxes } from '../api/endpoints/tax'
import { getCoinPrice } from '../api/endpoints/coinbase'
import { getTaxes, getInterests } from '../api/apollo'
export default {
  components: {
    MonthPicker,
    TaxesTable,
    Bar,
    LineChart: Line
  },
  data: () => ({
    allTaxes: [],
    taxes: [],
    activitySum: [],
    exchangeSum: [],
    coinsSum: [],
    monthNameActive: '',
    panel: [0],
    selectedRow: undefined,
    interests: []
  }),
  created() {
    this.loadTaxes()
    getInterests().then(r => {
      this.interests = [...r.filter(r => r.isTax && !r.soldTaxForBtc && !r.soldTaxForEth).map(r => r.name)]
      this.interests.push('BTC','ETH','XLM')
    })
  },
  methods: {
    async loadTaxes() {
      this.allTaxes = await getTaxes()
      this.onMonthClick(new Date().getMonth())
    },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    onMonthClick(dateMonth) {
      if(this.selectedRow !== undefined) {
        this.selectedRow.select(false)
      }

      if(dateMonth === 'ALL') {
        this.monthNameActive = 'All'
        this.taxes = this.allTaxes
        this.setSums()
      } else {
        this.monthNameActive = this.$store.getters.getMonthNames[dateMonth]
        this.taxes = this.allTaxes.filter(t => this.$store.getters.getUtcMonth(t.updatedAt) === dateMonth)
        this.setSums(dateMonth)
      }
    },
    onTaxUpdated(item) {
      this.$set(this.allTaxes, this.allTaxes.indexOf(t => t.id === item.id), item);
      this.onMonthClick(this.$store.getters.getUtcMonth(item.updatedAt))
    },
    onTaxAdded(item) {
      this.allTaxes.push(item)
      this.onMonthClick(this.$store.getters.getUtcMonth(item.updatedAt))
    },
    async onRefreshTax(callback) {
      let coinPrices = await getCoinPrice(new Set(this.allTaxes.filter(t => this.interests.includes(t.coin)).map(t => t.coin)))
      coinPrices.map(p => p.data.data).forEach(p => {
        let coinSum = this.coinsSum.find(s => s.coin === p.base)
        if(coinSum) {
          coinSum.val = coinSum.amount * p.amount
        }
        $cookies.set(p.base, p.amount)
      })

      let res = await refreshTaxes()
      if(res.status === 200) {
        this.loadTaxes()
        callback("done")
      } else {
        alert("PROBLEM")
      }
    },
    setSums(dateMonth) {
      this.activitySum = []
      this.exchangeSum = []
      this.coinsSum = []
      let idx = 0

      new Set(this.taxes.map(t => t.activity)).forEach(a => {
        this.activitySum.push({ activity: a, idx: idx++, sum: 
          this.taxes.filter(t => t.activity === a && (dateMonth ? new Date(t.updatedAt).getUTCMonth() === dateMonth : true)).map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0)
        })
      })
      new Set(this.taxes.map(t => t.exchange)).forEach(a => {
        this.exchangeSum.push({ exchange: a, idx: idx++, sum: 
          this.taxes.filter(t => t.exchange === a && (dateMonth ? new Date(t.updatedAt).getUTCMonth() === dateMonth : true)).map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0)
        })
      })
      new Set(this.taxes.map(t => t.coin)).forEach(a => {
        let coinCookie = $cookies.get(a)
        this.coinsSum.push({ coin: a, idx: idx++, sum: 
          this.taxes.filter(t => t.coin === a && (dateMonth ? new Date(t.updatedAt).getUTCMonth() === dateMonth : true)).map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0),
          amount: this.taxes.filter(t => t.coin === a && (dateMonth ? new Date(t.updatedAt).getUTCMonth() === dateMonth : true)).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0),
          val: coinCookie && this.interests.includes(a) ? this.taxes.filter(t => t.coin === a && (dateMonth ? new Date(t.updatedAt).getUTCMonth() === dateMonth : true)).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0) * coinCookie : 0
        })
      })
    },
    rowClick(e, row) {
      if(this.selectedRow !== undefined) {
        this.selectedRow.select(false)
      }

      if(this.selectedRow !== undefined && this.selectedRow.item.idx ===  e.idx) {
        this.selectedRow = undefined
        this.taxes = this.allTaxes.filter(t => this.monthNameActive === 'All' ? true : this.$store.getters.getUtcMonth(t.updatedAt) === this.$store.getters.getMonthNames.indexOf(this.monthNameActive))
      } else {
        if(e.hasOwnProperty('coin')) {
          this.taxes = this.allTaxes.filter(t => t.coin === e.coin && (this.monthNameActive === 'All' ? true : this.$store.getters.getUtcMonth(t.updatedAt) === this.$store.getters.getMonthNames.indexOf(this.monthNameActive)))
        } else if(e.hasOwnProperty('exchange')) {
          this.taxes = this.allTaxes.filter(t => t.exchange === e.exchange && (this.monthNameActive === 'All' ? true : this.$store.getters.getUtcMonth(t.updatedAt) === this.$store.getters.getMonthNames.indexOf(this.monthNameActive)))
        } else {
          this.taxes = this.allTaxes.filter(t => t.activity === e.activity && (this.monthNameActive === 'All' ? true : this.$store.getters.getUtcMonth(t.updatedAt) === this.$store.getters.getMonthNames.indexOf(this.monthNameActive)))
        }
        row.select(true)
        this.selectedRow = row
      }
    }
  }
}
</script>