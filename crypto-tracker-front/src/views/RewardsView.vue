<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <month-picker :trxs="this.allRewards" @monthClick="onMonthClick" />
      </v-col>
      <v-col cols="6">
        <rewards-table :rewards="rewards" :monthNameActive="monthNameActive" @refreshRewards="onRefreshRewards" />
      </v-col>
      <v-col cols="5">
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
        <v-card class="my-2" dark>
          <v-card-text class="subtitle-1 pa-3 d-flex">
            <div style="flex: 0 0 50%;">Rewards: <span class="red--text">{{ getAsCurrency(rewards.map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0)) }}</span></div>
            <div>Value: <span class="green--text">{{ getAsCurrency(coinsSum.map(t => parseFloat(t.val)).reduce((prev, next) => prev + next, 0)) }}</span></div>
          </v-card-text>
        </v-card>
        <line-chart :allRewards="allRewards" class="mt-2"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import MonthPicker from '../components/shared/MonthPicker'
import RewardsTable from '../components/rewards/RewardsTable'
import { getCoinPrice } from '../api/endpoints/coinbase'
import { getRewards, getInterests } from '../api/apollo'
import { refreshRewards } from '../api/endpoints/rewards'
import Line from '../components/rewards/charts/Line'
export default {
  components: {
    MonthPicker,
    RewardsTable,
    LineChart: Line
  },
  data: () => ({
    allRewards: [],
    rewards: [],
    monthNameActive: '',
    interests: [],
    coinsSum: [],
    selectedRow: undefined,
  }),
  created() {
    this.loadRewards()
    getInterests().then(r => {
      this.interests = [...r.filter(r => r.isReward).map(r => r.name)]
    })
  },
  methods: {
    async loadRewards() {
      this.allRewards = await getRewards()
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
        this.rewards = this.allRewards
        this.setSums()
      } else {
        this.monthNameActive = this.$store.getters.getMonthNames[dateMonth]
        this.rewards = this.allRewards.filter(t => this.$store.getters.getUtcMonth(t.updatedAt) === dateMonth)
        this.setSums(dateMonth)
      }
    },
    async onRefreshRewards(callback) {
      let coinPrices = await getCoinPrice(new Set(this.allRewards.filter(t => this.interests.includes(t.coin)).map(t => t.coin)))
      coinPrices.map(p => p.data.data).forEach(p => {
        let coinSum = this.coinsSum.find(s => s.coin === p.base)
        if(coinSum) {
          coinSum.val = coinSum.amount * p.amount
        }
        $cookies.set(p.base, p.amount)
      })
      
      let res = await refreshRewards()
      if(res.status === 200) {
        this.loadRewards()
        callback("done")
      } else {
        alert("PROBLEM")
      }
    },
    setSums(dateMonth) {
      this.coinsSum = []

      new Set(this.rewards.map(t => t.coin)).forEach(a => {
        let coinCookie = $cookies.get(a)
        this.coinsSum.push({ coin: a, sum: 
          this.rewards.filter(t => t.coin === a && (dateMonth ? new Date(t.updatedAt).getUTCMonth() === dateMonth : true)).map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0),
          amount: this.rewards.filter(t => t.coin === a && (dateMonth ? new Date(t.updatedAt).getUTCMonth() === dateMonth : true)).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0),
          val: coinCookie ? this.rewards.filter(t => t.coin === a && (dateMonth ? new Date(t.updatedAt).getUTCMonth() === dateMonth : true)).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0) * coinCookie : 0
        })
      })
    },
    rowClick(e, row) {
      if(this.selectedRow !== undefined) {
        this.selectedRow.select(false)
      }

      if(this.selectedRow !== undefined && this.selectedRow.item.coin ===  e.coin) {
        this.selectedRow = undefined
        this.rewards = this.allRewards.filter(t => this.monthNameActive === 'All' ? true : this.$store.getters.getUtcMonth(t.updatedAt) === this.$store.getters.getMonthNames.indexOf(this.monthNameActive))
      } else {
        this.rewards = this.allRewards.filter(t => t.coin === e.coin && (this.monthNameActive === 'All' ? true : this.$store.getters.getUtcMonth(t.updatedAt) === this.$store.getters.getMonthNames.indexOf(this.monthNameActive)))
        row.select(true)
        this.selectedRow = row
      }
    }
  }
}
</script>