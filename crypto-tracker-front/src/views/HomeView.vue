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
              <v-btn color="primary" dark @click="refreshValue" :loading="loading" :disabled="loading">
                <v-icon dark>
                  mdi-refresh
                </v-icon>
              </v-btn>
            </div>
            <div class="pt-1" style="flex: 0 0 35%;"><span class="red--text">{{ getAsCurrency(coinsSum.map(t => parseFloat(t.spent)).reduce((prev, next) => prev + next, 0)) }}</span></div>
            <div class="pt-1"><span class="green--text">{{ getAsCurrency(coinsSum.map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0)) }}</span></div>
          </v-card-text>
        </v-card>
        <v-data-table
          dark
          :loading="loading"
          hide-default-footer
          dense
          disable-pagination
          :headers="[{ text: 'Coin', value: 'coin' },{ text: 'Price', value: 'price' },{ text: 'Value', value: 'value' },{ text: 'Gain', value: 'gain' }]"
          :items="coinsSum"
          item-key="coin"
          class="elevation-10">
          <template v-slot:[`item.value`]="{ item }">
            <span>{{ getAsCurrency(item.value) }}</span>
          </template>
          <template v-slot:[`item.price`]="{ item }">
            <span>{{ getAsCurrency(item.price) }}</span>
          </template>
          <template v-slot:[`item.gain`]="{ item }">
            <div class="rounded text-center" :style="`background-color: ${ getGain(item) > 0 ? '#4CAF50' : getGain(item) === 0 ? '#FAFAFA' : '#F44336' }`">
              <span class="black--text">{{ getGain(item).toFixed(2) }}%</span>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getInvestments, getRewards, getTaxes, getInterests } from '../api/apollo'
import { getCoinPrice } from '../api/endpoints/coinbase'
import LineChart from '../components/home/Line.vue'
export default {
  name: 'home-view',
  data () {
    return {
      rewards: [],
      investments: [],
      taxes: [],
      interests: [],
      coinsSum: [],
      profitHistory: [],
      loading: false
    }
  },
  components: {
    LineChart
  },
  async created() {
    Promise.all([getRewards(), getInvestments(), getTaxes(), getInterests()]).then(r => {
      this.rewards = r[0]
      this.investments = r[1]
      this.taxes = r[2]
      this.interests = r[3]
      this.sumCoins()
      this.profitHistory = JSON.parse($cookies.get("profitHistory")) || []
    })
  },
  methods: {
    getGain(item) {
      return ((item.price - item.oldPrice) / item.price) * 100
    },
    sumCoins() {
      this.interests.forEach(r => {
        if(r.name === 'USDC' || (r.isTax && (r.soldTaxForBtc || r.soldTaxForEth) && !r.isReward)) {
          return
        }

        let coinCookie = $cookies.get(r.name) || 0
        let amount = (this.rewards.filter(f => f.coin === r.name).map(f => parseFloat(f.amount)).reduce((prev, next) => prev + next, 0) +
            this.investments.filter(f => f.coin === r.name).map(f => parseFloat(f.amount)).reduce((prev, next) => prev + next, 0) +
            this.taxes.filter(f => f.coin === r.name).map(f => parseFloat(f.amount)).reduce((prev, next) => prev + next, 0))
        let obj = this.coinsSum.find(c => c.coin === r.name)
        if(obj) {
          obj.oldPrice = obj.price
          obj.price = Number(coinCookie)
          obj.value = amount * coinCookie
        } else {
          this.coinsSum.push( { coin: r.name, oldPrice: 0, price: Number(coinCookie), amount: amount, value: amount * coinCookie,
            spent: this.investments.filter(f => f.coin === r.name).map(f => parseFloat(f.spent)).reduce((prev, next) => prev + next, 0)
          })
        }
      })
    },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    async refreshValue() {
      this.loading = true
      let coinPrices = await getCoinPrice(this.interests.map(r => r.name))
      coinPrices.map(p => p.data.data).forEach(p => {
        $cookies.set(p.base, p.amount)
      })
      this.sumCoins()

      this.profitHistory = JSON.parse($cookies.get("profitHistory")) || []
      if(this.profitHistory.length === 20) {
        this.profitHistory.shift()
      }
      let time = new Date();
      let dateVal = time.getDate() + 'th ' + time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

      this.profitHistory.push({date: dateVal, sum: this.coinsSum.map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0) - this.coinsSum.map(t => parseFloat(t.spent)).reduce((prev, next) => prev + next, 0)})
      $cookies.set("profitHistory", JSON.stringify(this.profitHistory))
      this.loading = false
    }
  }
}
</script>