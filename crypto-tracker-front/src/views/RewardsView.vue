<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <month-picker :trxs="allRewards" @monthClick="onMonthClick" />
      </v-col>
      <v-col cols="6">
        <rewards-table :rewards="rewards" :monthNameActive="monthNameActive" @refreshRewards="onRefreshRewards" />
      </v-col>
      <v-col cols="5">
        <v-container fluid class="px-1">
          <v-row no-gutters>
            <v-col cols="5">
            <v-card dark>
              <v-card-text class="subtitle-1 pa-3 d-flex">
                <div style="flex: 0 0 50%;">Sum: <span class="red--text">{{ getAsCurrency(rewards.map(t => t.value).reduce((prev, next) => prev + next, 0)) }}</span></div>
                <div>Value: <span class="green--text">{{ getAsCurrency(coinsSum.map(t => t.val).reduce((prev, next) => prev + next, 0)) }}</span></div>
              </v-card-text>
            </v-card>
            <v-card class="mt-2" dark>
              <v-card-text class="subtitle-1 pa-3 d-flex">
                <div style="flex: 0 0 50%;">Rate: <span class="red--text">{{ ((rewards.map(t => t.value).reduce((prev, next) => prev + next, 0) / $store.state.spendingTrxs.filter(t => dateIsInRange(t.updatedAt, monthNameActive)).map(item => item.amount).reduce((prev, next) => prev + next, 0)) * 100).toFixed(2) }}%</span></div>
                <div>Actual: <span class="green--text">{{ ((coinsSum.map(t => t.val).reduce((prev, next) => prev + next, 0) / $store.state.spendingTrxs.filter(t => dateIsInRange(t.updatedAt, monthNameActive)).map(item => item.amount).reduce((prev, next) => prev + next, 0)) * 100).toFixed(2) }}%</span></div>
              </v-card-text>
            </v-card>
            </v-col>
            <v-col cols="7">
            <v-data-table @click:row="rowClick" single-select dark hide-default-footer dense disable-pagination :items="coinsSum" item-key="coin" class="elevation-10 row-pointer ml-2"
              :headers="[{ text: 'Coin', value: 'coin' },{ text: 'Amount', value: 'amount' },{ text: 'Sum', value: 'sum' },{ text: 'Value', value: 'val' }]">
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
        </v-container>
        <v-divider dark class="my-3" />
        <line-chart :allRewards="allRewards" class="mt-2"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import MonthPicker from '../components/shared/MonthPicker'
import RewardsTable from '../components/rewards/RewardsTable'
import { refreshRewards } from '../api/endpoints/rewards'
import Line from '../components/rewards/charts/Line'
import dateMixin from '@/mixins/datesMixin'
export default {
  components: {
    MonthPicker,
    RewardsTable,
    LineChart: Line
  },
  mixins: [dateMixin],
  data: () => ({
    rewards: [],
    monthNameActive: '',
    coinsSum: [],
    selectedRow: undefined
  }),
  created() {
    this.loadRewards()    
  },
  computed: {
    allRewards() {
      return this.$store.state.allRewards
    }
  },
  watch: {
    allRewards(newAllTheRewards) {
      this.loadRewards()
    }
  },
  methods: {
    loadRewards() {
      this.onMonthClick(this.monthNameActive !== '' ? this.monthNameActive : {month: new Date().getMonth(), year: new Date().getFullYear()})
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
      this.monthNameActive = dateMonth

      if(dateMonth === 'ALL') {
        this.rewards = this.allRewards
        this.setSums()
      } else {
        this.rewards = this.allRewards.filter(t => this.dateIsInRange(t.updatedAt, dateMonth))
        this.setSums(dateMonth)
      }
    },
    async onRefreshRewards(callback) {
      let res = await refreshRewards(this.$store.state.interests.filter(r => r.isReward).map(r => r.name))
      let unique = res.data.filter(p => !this.allRewards.some(t => t.exchangeId === p.exchangeId))
      this.$store.commit('addRewardMany', unique)
      callback("done")
    },
    async setSums(dateMonth) {
      this.coinsSum = []

      new Set(this.rewards.map(t => t.coin)).forEach(async a => {
        let coinCookie = this.$store.getters.getCoinPrice(a)
        this.coinsSum.push({ coin: a, sum: 
          this.rewards.filter(t => t.coin === a && (dateMonth ? this.dateIsInRange(t.updatedAt, dateMonth) : true)).map(t => t.value).reduce((prev, next) => prev + next, 0),
          amount: this.rewards.filter(t => t.coin === a && (dateMonth ? this.dateIsInRange(t.updatedAt, dateMonth) : true)).map(t => t.amount).reduce((prev, next) => prev + next, 0),
          val: this.rewards.filter(t => t.coin === a && t.liquidation === null && (dateMonth ? this.dateIsInRange(t.updatedAt, dateMonth) : true)).map(t => t.amount).reduce((prev, next) => prev + next, 0) * coinCookie.price
        })
      })
    },
    rowClick(e, row) {
      if(this.selectedRow !== undefined) {
        this.selectedRow.select(false)
      }

      if(this.selectedRow !== undefined && this.selectedRow.item.coin ===  e.coin) {
        this.selectedRow = undefined
        this.rewards = this.allRewards.filter(t => this.monthNameActive === 'ALL' ? true : this.dateIsInRange(t.updatedAt, this.monthNameActive))
      } else {
        this.rewards = this.allRewards.filter(t => t.coin === e.coin && (this.monthNameActive === 'ALL' ? true : this.dateIsInRange(t.updatedAt, this.monthNameActive)))
        row.select(true)
        this.selectedRow = row
      }
    }
  }
}
</script>