<template>
  <v-container fluid>
    <v-row>
      <v-col cols="9">
        <line-chart :items="profitHistory" />
      </v-col>
      <v-col cols="3">
        <v-card class="my-2" dark color="#616161">
          <v-card-text class="subtitle-1 pa-1 d-flex" style="align-items: center;justify-content: space-evenly">
            <div class="black--text text--darken-1">{{ getAsCurrency(homeCoinsSum.map(t => t.spent).reduce((prev, next) => prev + next, 0)) }}</div>
            <v-divider vertical dark />
            <div class="gray--text">{{ getAsCurrency(homeCoinsSum.map(t => ((t.reward + t.tax + t.invest + t.liq) * t.price)).reduce((prev, next) => prev + next, 0)) }}</div>
            <v-divider vertical />
            <div class="green--text">
              {{ getAsCurrency(taxes.filter(t => t.coin === 'USDC').map(t => t.value).reduce((prev, next) => prev + next, 0) +
                  liquidation.filter(t => t.event === 'Sell').map(t => t.usdAmount).reduce((prev, next) => prev + next, 0)) }}
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
          @click:row="homeCoinsClick"
          single-select 
          dark
          :loading="loading"
          hide-default-footer
          hide-default-header
          dense
          disable-pagination
          :headers="[{ text: 'Coin', value: 'coin' },{ text: 'Price', value: 'price' },{ text: 'Value', value: 'value' },{ text: 'Gain', value: 'gain' },{ text: 'Life', value: 'life' }]"
          :items="homeCoinsSum"
          item-key="coin"
          class="elevation-10 home-table row-pointer">
          <template v-slot:[`item.coin`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div style="cursor: pointer" class="rounded text-center" v-bind="attrs" v-on="on">
                  {{ item.coin }}
                </div>
              </template>
              <div v-if="item.reward > 0">Rewards: {{ item.reward.toFixed(8) }}</div>
              <div v-if="item.tax > 0">Taxes: {{ item.tax.toFixed(8) }}</div>
              <div v-if="item.invest > 0">Investments: {{ item.invest.toFixed(8) }}</div>
              <div v-if="item.liq > 0">Liquidations: {{ item.liq.toFixed(8) }}</div>
              <v-divider color="#000" class="my-2"></v-divider>
              <div class="font-weight-black">Total: {{ (item.reward + item.tax + item.invest + item.liq).toFixed(8) }}</div>
            </v-tooltip>
          </template>
          <template v-slot:[`item.value`]="{ item }">
            <span>{{ getAsCurrency((item.reward + item.tax + item.invest + item.liq) * item.price) }}</span>
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
                  <span class="black--text">{{ ((((item.reward + item.tax + item.invest + item.liq) * item.price) / item.origValue) * 100).toFixed(2) }}%</span>
                </div>
              </template>
              <span>{{ getAsCurrency(item.origValue) }}</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-divider dark class="my-3"></v-divider>
    <history-line :priceHistory="$store.state.historyChartData" />
    <v-divider dark class="my-3"></v-divider>
    <coin-history-line :priceHistory="$store.state.historyChartData" />
    <v-dialog color="#E1F5FE" v-model="smallCoinDialog" max-width="1500px">
      <small-doing-dialog :coinName="smallCoinName" />
    </v-dialog>
  </v-container>
</template>

<script>
import { refreshPriceHistory } from '../api/endpoints/priceHistory'
import LineChart from '../components/home/Line'
import HistoryLine from '@/components/home/HistoryLine'
import SmallDoingDialog from '@/components/home/SmallCoinLine'
import CoinHistoryLine from '@/components/home/CoinHistoryLine'
import { getPHistory } from '../api/apollo'
const { isBefore, isSameDay, endOfYesterday, formatISO } = require('date-fns')
import chroma from "chroma-js";
export default {
  name: 'home-view',
  data: () => ({
    profitHistory: [],
    homeCoinsSum: [],
    loading: false,
    smallCoinDialog: false,
    smallCoinName: ''
  }),
  components: {
    LineChart,
    HistoryLine,
    CoinHistoryLine,
    SmallDoingDialog
  },
  async created() {
    if(this.$store.state.historyChartData.length > 0) {
      this.sumCoins()
    } else if(this.investments.length && this.taxes.length && this.rewards.length && this.liquidation.length) {
      getPHistory().then(hist => {
        this.sumCoins()
        this.parsePriceHistory(hist)
      })
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
    async allCoins(newVal) {
      if(this.investments.length && this.taxes.length && this.rewards.length && this.liquidation.length) {
        await this.sumCoins()
        getPHistory().then(hist => this.parsePriceHistory(hist))
      }
    }
  },
  methods: {
    getOrigValBackground(item) {
      let scale = chroma.scale(['#F44336', '#4CAF50']).domain([.10,1.10]).mode('hsl')
      return `background-color: ${ scale(((item.reward + item.tax + item.invest + item.liq) * item.price) / item.origValue).hex() }`
    },
    async onlyGains() {
      await this.sumCoins(true)
    },
    getGain(item) {
      return ((item.price - item.oldPrice) / item.price) * 100
    },
    async sumCoins(forceUpdate) {
      this.loading = true
      let interests = this.$store.state.interests.filter(r => r.nickName !== '')
      for (const r of interests) { 
        let coinCookie = forceUpdate === undefined ? this.$store.getters.getCoinPrice(r.name) : await this.$store.dispatch('getCoinPrice', r.name)
        let rew = this.rewards.filter(f => f.coin === r.name && f.liquidation === null)
        let inv = this.investments.filter(f => f.coin === r.name && f.liquidation === null)
        let tax = this.taxes.filter(f => f.coin === r.name && f.liquidation === null)
        let liq = this.liquidation.filter(f => f.newCoin === r.name && f.liquidation === null)
        
        let origValue = rew.map(f => f.value).reduce((prev, next) => prev + next, 0) + inv.map(f => f.spent).reduce((prev, next) => prev + next, 0) +
          tax.map(f => f.value).reduce((prev, next) => prev + next, 0) + liq.map(f => f.usdAmount).reduce((prev, next) => prev + next, 0)

        let item = { coin: r.name, price: coinCookie.price, oldPrice: coinCookie.oldPrice, origValue: origValue, reward: rew.map(f => f.amount).reduce((prev, next) => prev + next, 0),
          tax: tax.map(f => f.amount).reduce((prev, next) => prev + next, 0), invest: inv.map(f => f.amount).reduce((prev, next) => prev + next, 0),
          liq: liq.map(f => f.newCoinAmount).reduce((prev, next) => prev + next, 0),
          spent: this.investments.filter(f => f.coin === r.name).map(f => f.spent).reduce((prev, next) => prev + next, 0)
        }

        const itemId = this.homeCoinsSum.findIndex(c => c.coin === item.coin)
        if(itemId === -1) {
          this.homeCoinsSum.push(item)
        } else {
          let itemToUpdate = Object.assign(this.homeCoinsSum[itemId], item)
          this.$set(this.homeCoinsSum, itemId, itemToUpdate)
        }
      }
      this.$store.commit('setChartHistoryTransient', this.homeCoinsSum)
      this.loading = false
    },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    parsePriceHistory(hist, refresh) {
      let histItems = []
      for (const p of hist) {
        let newData = { date: p.updatedAt.slice(0, 10), coins: [] }
        for (const price of p.prices) {
          let coinSum = (this.rewards.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.coin === price.coin).map(i => i.amount).reduce((prev, next) => prev + next, 0) +
            this.taxes.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.coin === price.coin).map(i => i.amount).reduce((prev, next) => prev + next, 0) +
            this.investments.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.coin === price.coin).map(i => i.amount).reduce((prev, next) => prev + next, 0) +
            this.liquidation.filter(i => (isBefore(this.getDateAsUtc(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(this.getDateAsUtc(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.newCoin === price.coin).map(i => i.newCoinAmount).reduce((prev, next) => prev + next, 0)) -
            this.liquidation.filter(i => (isBefore(this.getDateAsUtc(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(this.getDateAsUtc(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.coin === price.coin).map(i => i.coinAmount).reduce((prev, next) => prev + next, 0)

          newData.coins.push({ coin: price.coin, coinSum, value: coinSum * price.price })
        }
        histItems.push(newData)
      }
      if(refresh !== undefined) {
        this.$store.commit('addChartHistory', histItems)
      } else {
        this.$store.commit('setChartHistory', histItems)
      }
    },
    async refreshValue() {
      this.loading = true
      if(this.$store.state.historyChartData.find(p => p.date === formatISO(endOfYesterday()).slice(0, 10)) === undefined ||
          this.$store.state.historyChartData.find(p => p.date === formatISO(endOfYesterday()).slice(0, 10) && p.transient === true) !== undefined) {
        let priceHistory = await refreshPriceHistory()
        this.$store.commit('rmChartHistoryTransient')
        this.parsePriceHistory(priceHistory.data, true)
      }

      await this.sumCoins(true)

      if(this.profitHistory.length === 33) {
        this.profitHistory.shift()
      }

      let dateVal = `${new Date().getDate()} ${new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
      this.profitHistory.push({date: dateVal, sum: this.homeCoinsSum.map(t => ((t.reward + t.tax + t.invest + t.liq) * t.price)).reduce((prev, next) => prev + next, 0) - this.homeCoinsSum.map(t => t.spent).reduce((prev, next) => prev + next, 0)})
      $cookies.set("profitHistory", JSON.stringify(this.profitHistory))
      this.loading = false
    },
    getDateAsUtc(d) {
      let n = new Date(d)
      return new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())
    },
    homeCoinsClick(row) {
      this.smallCoinDialog = true
      this.smallCoinName = row.coin
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