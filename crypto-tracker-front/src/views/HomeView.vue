<template>
  <v-container fluid>
    <v-row>
      <v-col cols="9">
        <line-chart :items="profitHistory" />
      </v-col>
      <v-col cols="3">
        <v-card class="my-2" dark>
          <v-card-text class="subtitle-1 pa-1 d-flex">
            <div style="flex: 0 0 30%;">
              <v-btn color="primary" dark @contextmenu.prevent="onlyGains" @click="refreshValue" :loading="loading" :disabled="loading">
                <v-icon dark>
                  mdi-refresh
                </v-icon>
              </v-btn>
            </div>
            <div class="pt-1" style="flex: 0 0 35%;"><span class="red--text">{{ getAsCurrency($store.state.homeCoinsSum.map(t => parseFloat(t.spent)).reduce((prev, next) => prev + next, 0)) }}</span></div>
            <div class="pt-1"><span class="green--text">{{ getAsCurrency($store.state.homeCoinsSum.map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0)) }}</span></div>
          </v-card-text>
        </v-card>
        <v-data-table
          dark
          :loading="loading"
          hide-default-footer
          dense
          disable-pagination
          :headers="[{ text: 'Coin', value: 'coin' },{ text: 'Price', value: 'price' },{ text: 'Value', value: 'value' },{ text: 'Gain', value: 'gain' }]"
          :items="$store.state.homeCoinsSum"
          item-key="coin"
          class="elevation-10 home-table">
          <template v-slot:[`item.value`]="{ item }">
            <span>{{ getAsCurrency(item.value) }}</span>
          </template>
          <template v-slot:[`item.price`]="{ item }">
            <span>{{ getAsCurrency(item.price) }}</span>
          </template>
          <template v-slot:[`item.gain`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div style="cursor: pointer" class="rounded text-center" :style="`background-color: ${ getGain(item) > 0 ? '#4CAF50' : getGain(item) === 0 ? '#FAFAFA' : '#F44336' }`" v-bind="attrs" v-on="on">
                  <span class="black--text">{{ getGain(item).toFixed(2) }}%</span>
                </div>
              </template>
              <span>{{ item.oldPrice }}</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <history-line :priceHistory="priceHistory" />
    <coin-history-line :priceHistory="priceHistory" />
  </v-container>
</template>

<script>
import { getCoinPrice } from '../api/endpoints/coinbase'
import { refreshPriceHistory } from '../api/endpoints/priceHistory'
import LineChart from '../components/home/Line.vue'
import HistoryLine from '@/components/home/HistoryLine'
import CoinHistoryLine from '@/components/home/CoinHistoryLine'
import { getPriceHistory } from '../api/apollo'
const { isBefore, isSameDay } = require('date-fns')
export default {
  name: 'home-view',
  data () {
    return {
      profitHistory: [],
      priceHistory: [],
      loading: false
    }
  },
  components: {
    LineChart,
    HistoryLine,
    CoinHistoryLine
  },
  async created() {
    getPriceHistory().then(hist => {
      this.parsePriceHistory(hist)
    })
    this.profitHistory = JSON.parse($cookies.get("profitHistory")) || []
  },
  computed: {
    investments() {
      return this.$store.state.allInvestments
    },
    taxes() {
      return this.$store.state.allTaxes
    },
    rewards() {
      return this.$store.state.allRewards
    },
  },
  watch: {
    investments(newVal) {
      this.sumCoins()
    }
  },
  methods: {
    async onlyGains() {
      this.loading = true
      let coinPrices = await getCoinPrice(this.$store.state.interests.filter(r => !(r.isTax && (r.soldTaxForBtc || r.soldTaxForEth) && !r.isReward)).map(r => r.name))
      coinPrices.map(p => p.data.data).forEach(p => {
        $cookies.set(p.base, p.amount)
      })
      this.sumCoins()
      this.loading = false
    },
    getGain(item) {
      return ((item.price - item.oldPrice) / item.price) * 100
    },
    sumCoins() {
      this.$store.state.interests.forEach(r => {
        if(r.name === 'USDC' || (r.isTax && (r.soldTaxForBtc || r.soldTaxForEth) && !r.isReward)) {
          return
        }

        let coinCookie = $cookies.get(r.name) || 0
        let amount = (this.rewards.filter(f => f.coin === r.name && f.liquidation === null).map(f => parseFloat(f.amount)).reduce((prev, next) => prev + next, 0) +
            this.investments.filter(f => f.coin === r.name).map(f => parseFloat(f.amount)).reduce((prev, next) => prev + next, 0) +
            this.taxes.filter(f => f.coin === r.name).map(f => parseFloat(f.amount)).reduce((prev, next) => prev + next, 0))
        this.$store.commit('updateCoinsSum',
          { item: { coin: r.name, price: Number(coinCookie), amount: amount, value: amount * coinCookie,
            spent: this.investments.filter(f => f.coin === r.name).map(f => parseFloat(f.spent)).reduce((prev, next) => prev + next, 0) } 
          })
      })
    },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    parsePriceHistory(hist) {
      for (const p of hist) {
        let coinSum = this.rewards.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.date)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.date))) && i.coin === p.coin && i.liquidation === null).map(i => parseFloat(i.amount)).reduce((prev, next) => prev + next, 0) +
          this.taxes.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.date)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.date))) && i.coin === p.coin).map(i => parseFloat(i.amount)).reduce((prev, next) => prev + next, 0) +
          this.investments.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.date)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.date))) && i.coin === p.coin).map(i => parseFloat(i.amount)).reduce((prev, next) => prev + next, 0)

        if(coinSum) {
          const itemId = this.priceHistory.findIndex(c => c.date === p.date)
          if(itemId === -1) {
            this.priceHistory.push({ date: p.date, coins: [{ coin: p.coin, coinSum, value: coinSum * p.price }] })
          } else {
            this.priceHistory[itemId].coins.push({ coin: p.coin, coinSum, value: coinSum * p.price })
          }
        }
      }
    },
    async refreshValue() {
      this.loading = true

      let priceHistory = await refreshPriceHistory()
      this.parsePriceHistory(priceHistory.data.flat())

      let coinPrices = await getCoinPrice(this.$store.state.interests.filter(r => !(r.isTax && (r.soldTaxForBtc || r.soldTaxForEth) && !r.isReward)).map(r => r.name))
      coinPrices.map(p => p.data.data).forEach(p => {
        $cookies.set(p.base, p.amount)
      })
      this.sumCoins()

      if(this.profitHistory.length === 33) {
        this.profitHistory.shift()
      }
      let time = new Date();
      let dateVal = `${time.getDate()} ${time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`

      this.profitHistory.push({date: dateVal, sum: this.$store.state.homeCoinsSum.map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0) - this.$store.state.homeCoinsSum.map(t => parseFloat(t.spent)).reduce((prev, next) => prev + next, 0)})
      $cookies.set("profitHistory", JSON.stringify(this.profitHistory))
      this.loading = false
    },
    getDateAsUtc(d) {
      let n = new Date(d)
      return new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())
    }
  }
}
</script>
<style>
  .home-table > .v-data-table__wrapper > table > tbody > tr > td{
    height: 24px !important;
  }
</style>