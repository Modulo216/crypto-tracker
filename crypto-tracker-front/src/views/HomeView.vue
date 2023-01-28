<template>
  <v-container fluid>
    <v-row>
      <v-col cols="9">
        <line-chart :items="profitHistory" />
      </v-col>
      <v-col cols="3">
        <v-card class="my-2" dark color="#616161">
          <v-card-text class="subtitle-1 pa-1 d-flex" style="align-items: center;justify-content: space-evenly">
            <div class="black--text text--darken-1">{{ getAsCurrency($store.state.homeCoinsSum.map(t => parseFloat(t.spent)).reduce((prev, next) => prev + next, 0)) }}</div>
            <v-divider vertical dark />
            <div class="gray--text">{{ getAsCurrency($store.state.homeCoinsSum.map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0)) }}</div>
            <v-divider vertical />
            <div class="green--text">
              {{ getAsCurrency(taxes.filter(t => t.coin === 'USDC').map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0) +
                  liquidation.filter(t => t.event === 'Sell').map(t => parseFloat(t.usdAmount)).reduce((prev, next) => prev + next, 0)) }}
            </div>
            <v-divider vertical />
            <div>
              <v-btn color="primary" dark @contextmenu.prevent="onlyGains" @click="refreshValue" :loading="loading" :disabled="loading">
                <v-icon dark>
                  mdi-refresh
                </v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
        <v-data-table
          dark
          :loading="loading"
          hide-default-footer
          hide-default-header
          dense
          disable-pagination
          :headers="[{ text: 'Coin', value: 'coin' },{ text: 'Price', value: 'price' },{ text: 'Value', value: 'value' },{ text: 'Gain', value: 'gain' },{ text: 'Life', value: 'life' }]"
          :items="$store.state.homeCoinsSum"
          item-key="coin"
          class="elevation-10 home-table">
          <template v-slot:[`item.coin`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div style="cursor: pointer" class="rounded text-center" v-bind="attrs" v-on="on">
                  {{ item.coin }}
                </div>
              </template>
              <span>{{ item.amount.toFixed(8) }}</span>
            </v-tooltip>
          </template>
          <template v-slot:[`item.value`]="{ item }">
            <span>{{ getAsCurrency(item.amount * item.price) }}</span>
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
          <template v-slot:[`item.life`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div style="cursor: pointer" class="rounded text-center" :style="getOrigValBackground(item)" v-bind="attrs" v-on="on">
                  <span class="black--text">{{ (((item.amount * item.price) / item.origValue) * 100).toFixed(2) }}%</span>
                </div>
              </template>
              <span>{{ getAsCurrency(item.origValue) }}</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-divider dark class="my-3"></v-divider>
    <history-line :priceHistory="priceHistory" />
    <v-divider dark class="my-3"></v-divider>
    <coin-history-line :priceHistory="priceHistory" />
  </v-container>
</template>

<script>
import { getCoinPrice } from '../api/endpoints/coinbase'
import { refreshPriceHistory } from '../api/endpoints/priceHistory'
import LineChart from '../components/home/Line.vue'
import HistoryLine from '@/components/home/HistoryLine'
import CoinHistoryLine from '@/components/home/CoinHistoryLine'
import { getPHistory } from '../api/apollo'
const { isBefore, isSameDay, endOfYesterday, formatISO } = require('date-fns')
import chroma from "chroma-js";
export default {
  name: 'home-view',
  data: () => ({
    profitHistory: [],
    priceHistory: [],
    loading: false
  }),
  components: {
    LineChart,
    HistoryLine,
    CoinHistoryLine
  },
  async created() {
    if(this.$store.state.historyChartData.length > 0) {
      this.priceHistory = this.$store.state.historyChartData
    } else if(this.investments.length && this.taxes.length && this.rewards.length && this.liquidation.length) {
      this.sumCoins()
      getPHistory().then(hist => this.parsePriceHistory(hist))
    }
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
    liquidation() {
      return this.$store.state.allLiquidation
    },
    allCoins() {
      return this.$store.state.allInvestments + this.$store.state.allTaxes + this.$store.state.allRewards + this.$store.state.allLiquidation
    }
  },
  watch: {
    allCoins(newVal) {
      if(this.investments.length && this.taxes.length && this.rewards.length && this.liquidation.length) {
        this.sumCoins()
        getPHistory().then(hist => this.parsePriceHistory(hist))
      }
    }
  },
  methods: {
    getOrigValBackground(item) {
      let scale = chroma.scale(['#F44336', '#4CAF50']).domain([.10,1.10]).mode('hsl')
      return `background-color: ${ scale((item.amount * item.price) / item.origValue).hex() }`
    },
    async onlyGains() {
      this.loading = true
      let coinPrices = await getCoinPrice(this.$store.state.interests.filter(r => r.nickName !== '').map(r => r.name))
      coinPrices.data.forEach(p => {
        $cookies.set(p.base, p.amount)
      })
      this.sumCoins()
      this.loading = false
    },
    getGain(item) {
      return ((item.price - item.oldPrice) / item.price) * 100
    },
    sumCoins() {
      this.$store.state.interests.filter(r => r.nickName !== '').forEach(r => {
        let coinCookie = $cookies.get(r.name) || 0
        let rew = this.rewards.filter(f => f.coin === r.name && f.liquidation === null)
        let inv = this.investments.filter(f => f.coin === r.name && f.liquidation === null)
        let tax = this.taxes.filter(f => f.coin === r.name && f.liquidation === null)
        let liq = this.liquidation.filter(f => f.newCoin === r.name && f.liquidation === null)

        let amount = rew.map(f => parseFloat(f.amount)).reduce((prev, next) => prev + next, 0) + inv.map(f => parseFloat(f.amount)).reduce((prev, next) => prev + next, 0) +
          tax.map(f => parseFloat(f.amount)).reduce((prev, next) => prev + next, 0) + liq.map(f => parseFloat(f.newCoinAmount)).reduce((prev, next) => prev + next, 0)
        let origValue = rew.map(f => parseFloat(f.value)).reduce((prev, next) => prev + next, 0) + inv.map(f => parseFloat(f.spent)).reduce((prev, next) => prev + next, 0) +
          tax.map(f => parseFloat(f.value)).reduce((prev, next) => prev + next, 0) + liq.map(f => parseFloat(f.usdAmount)).reduce((prev, next) => prev + next, 0)

        this.$store.commit('updateCoinsSum',
          { item: { coin: r.name, price: Number(coinCookie), amount: amount, origValue: origValue,
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
        for (const price of p.prices) {
          let coinSum = (this.rewards.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.coin === price.coin).map(i => parseFloat(i.amount)).reduce((prev, next) => prev + next, 0) +
            this.taxes.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.coin === price.coin).map(i => parseFloat(i.amount)).reduce((prev, next) => prev + next, 0) +
            this.investments.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.coin === price.coin).map(i => parseFloat(i.amount)).reduce((prev, next) => prev + next, 0) +
            this.liquidation.filter(i => (isBefore(this.getDateAsUtc(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(this.getDateAsUtc(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.newCoin === price.coin).map(i => parseFloat(i.newCoinAmount)).reduce((prev, next) => prev + next, 0)) -
            this.liquidation.filter(i => (isBefore(this.getDateAsUtc(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(this.getDateAsUtc(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.coin === price.coin).map(i => parseFloat(i.coinAmount)).reduce((prev, next) => prev + next, 0)
          
          if(coinSum) {
            const itemId = this.priceHistory.findIndex(c => c.date === p.updatedAt.slice(0, 10))
            if(itemId === -1) {
              this.priceHistory.push({ date: p.updatedAt.slice(0, 10), coins: [{ coin: price.coin, coinSum, value: coinSum * price.price }] })
            } else {
              this.priceHistory[itemId].coins.push({ coin: price.coin, coinSum, value: coinSum * price.price })
            }
          }
        }
      }
      this.$store.commit('setChartHistory', this.priceHistory)
    },
    async refreshValue() {
      this.loading = true

      if(this.priceHistory.find(p => p.date === formatISO(endOfYesterday()).slice(0, 10)) === undefined) {
        let priceHistory = await refreshPriceHistory()
        this.parsePriceHistory(priceHistory.data)
      }

      let coinPrices = await getCoinPrice(this.$store.state.interests.filter(r => r.nickName !== '').map(r => r.name))
      coinPrices.data.forEach(p => {
        $cookies.set(p.base, p.amount)
      })
      this.sumCoins()

      if(this.profitHistory.length === 33) {
        this.profitHistory.shift()
      }

      let dateVal = `${new Date().getDate()} ${new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
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
    height: 26px !important;
    padding:0 8px 0 8px !important;
  }
</style>