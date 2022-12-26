<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <month-picker :trxs="allInvestments" @monthClick="onMonthClick" />
      </v-col>
      <v-col cols="6">
        <investments-table :investments="investments" :monthNameActive="monthNameActive" @refreshInvestments="onRefreshInvestments" @investmentAdded="onInvestmentAdded" />
      </v-col>
      <v-col cols="5">
        <v-data-table
          @click:row="rowClick"
          single-select
          dark
          hide-default-footer
          dense
          disable-pagination
          :headers="[{ text: 'Coin', value: 'coin' },{ text: 'Amount', value: 'amount' },{ text: 'Spent', value: 'spent' },{ text: 'Value', value: 'value' },{ text: 'Profit', value: 'profit' }]"
          :items="coinsSum"
          item-key="coin"
          class="elevation-10 row-pointer">
          <template v-slot:[`item.amount`]="{ item }">
            <span>{{ Number((item.amount).toFixed(8)) }}</span>
          </template>
          <template v-slot:[`item.spent`]="{ item }">
            <span>{{ getAsCurrency(item.spent) }}</span>
          </template>
          <template v-slot:[`item.value`]="{ item }">
            <span>{{ getAsCurrency(item.value) }}</span>
          </template>
          <template v-slot:[`item.profit`]="{ item }">
            <span>{{ (((item.value - item.spent) / item.spent) * 100).toFixed(2) }}%</span>
          </template>
        </v-data-table>
        <v-card class="my-2" dark>
          <v-card-text class="subtitle-1 pa-3 d-flex">
            <div style="flex: 0 0 50%;">Spent: <span class="red--text">{{ getAsCurrency(coinsSum.map(t => parseFloat(t.spent)).reduce((prev, next) => prev + next, 0)) }}</span></div>
            <div>Value: <span class="green--text">{{ getAsCurrency(coinsSum.map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0)) }}</span></div>
          </v-card-text>
        </v-card>
        <h3 class="pl-3">Bitcoin</h3>
        <line-chart :investments="allInvestments.filter(i => i.coin === 'BTC')" class="mt-2"/>
        <h3 class="pl-3">Ethereum</h3>
        <line-chart :investments="allInvestments.filter(i => i.coin === 'ETH')" class="mt-2"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import MonthPicker from '../components/shared/MonthPicker'
import { getCoinPrice } from '../api/endpoints/coinbase'
import { refreshInvestments } from '../api/endpoints/investments'
import InvestmentsTable from '../components/investments/InvestmentsTable'
import LineChart from '../components/investments/charts/Line'
import dateMixin from '@/mixins/datesMixin'
  export default {
    name: 'InvestmentsView',
    components: {
      MonthPicker,
      InvestmentsTable,
      LineChart
    },
    mixins: [dateMixin],
    data: () => ({
      investments: [],
      coinsSum: [],
      monthNameActive: '',
      selectedRow: undefined
    }),
    created() {
      this.loadInvestments()
    },
    computed: {
      allInvestments() {
        return this.$store.state.allInvestments
      }
    },
    watch: {
      allInvestments(newAllTheRewards) {
        this.loadInvestments()
      }
    },
    methods: {
      loadInvestments() {
        this.onMonthClick('ALL')
      },
      onMonthClick(dateMonth) {
        if(this.selectedRow !== undefined) {
          this.selectedRow.select(false)
          this.selectedRow = undefined
        }
        this.monthNameActive = dateMonth
        this.allInvestments.forEach(i => {
          let coinCookie = $cookies.get(i.coin)
          i.value = coinCookie ? coinCookie * i.amount : '$0.00'
        })
        
        if(dateMonth === 'ALL') {
          this.investments = this.allInvestments
          this.setSums()
        } else {
          this.investments = this.allInvestments.filter(t => this.dateIsInRange(t.updatedAt, dateMonth))
          this.setSums(dateMonth)
        }
      },
      async onRefreshInvestments(callback) {
        let coinPrices = await getCoinPrice(['BTC', 'ETH'])
        coinPrices.data.forEach(p => {
          $cookies.set(p.base, p.amount)
        })

        let res = await refreshInvestments()
        let unique = res.data.filter(p => !this.allInvestments.some(t => t.exchangeId === p.exchangeId))
        this.$store.commit('addInvestments', unique)
        callback("done")
        // this.loadInvestments()
      },
      getAsCurrency(numb) {
        return numb.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })
      },
      setSums(dateMonth) {
        this.coinsSum = []
        new Set(this.investments.map(t => t.coin)).forEach(a => {
          let coinCookie = $cookies.get(a)
          this.coinsSum.push({ coin: a, amount: 
            this.investments.filter(t => t.coin === a && (dateMonth ? this.dateIsInRange(t.updatedAt, dateMonth) : true)).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0),
            spent: this.investments.filter(t => t.coin === a && (dateMonth ? this.dateIsInRange(t.updatedAt, dateMonth) : true)).map(t => parseFloat(t.spent)).reduce((prev, next) => prev + next, 0),
            value: this.investments.filter(t => t.coin === a && (dateMonth ? this.dateIsInRange(t.updatedAt, dateMonth) : true)).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0) * coinCookie
          })
        })
      },
      onInvestmentAdded(item) {
        this.$store.commit('addInvestment', item)
        this.onMonthClick(this.monthNameActive)
      },
      rowClick(e, row) {
        if(this.selectedRow !== undefined) {
          this.selectedRow.select(false)
        }

        if(this.selectedRow !== undefined && this.selectedRow.item.coin ===  e.coin) {
          this.selectedRow = undefined
          this.investments = this.allInvestments.filter(t => this.monthNameActive === 'ALL' ? true : this.dateIsInRange(t.updatedAt, this.monthNameActive))
        } else {
          this.investments = this.allInvestments.filter(t => t.coin === e.coin && (this.monthNameActive === 'ALL' ? true : this.dateIsInRange(t.updatedAt, this.monthNameActive)))
          row.select(true)
          this.selectedRow = row
        }
      }
    }
  }
</script>
