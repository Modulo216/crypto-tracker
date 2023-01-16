<template>
  <v-container fluid>
    <v-row>
      <v-col lg="9" md="12">
        <v-data-table @click:row="(e) => activeRow = e" dark dense :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :headers="headers" :items="liquidations" item-key="id" class="elevation-10" hide-default-footer disable-pagination>
          <template v-slot:top>
            <v-toolbar flat>
              <v-spacer></v-spacer>
              <v-btn color="primary" dark @click="showLiquidationDialog = true">
                <v-icon dark>
                  mdi-water
                </v-icon>
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:[`item.event`]="{ item }">
            <span :class="getStyle(item)">{{ item.event }}</span>
          </template>
          <template v-slot:[`item.updatedAt`]="{ item }">
            <span :class="getStyle(item)">{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template v-slot:[`item.coin`]="{ item }">
            <span :class="getStyle(item)" v-if="item.event === 'Swap'">{{ item.coin }} -> {{ item.newCoin }}</span>
            <span :class="getStyle(item)" v-if="item.event === 'Sell'">{{ item.coin }} -> $$$</span>
          </template>
          <template v-slot:[`item.newCoinAmount`]="{ item }">
            <span :class="getStyle(item)" v-if="item.event === 'Swap'">{{ item.newCoinAmount }}</span>
            <span :class="getStyle(item)" v-if="item.event === 'Sell'">{{ getAsCurrency(parseFloat(item.usdAmount)) }}</span>
          </template>
          <template v-slot:[`item.type`]="{ item }">
            <span :class="getStyle(item)">{{ item.rewards.length ? 'R' : '' }} {{ item.taxes.length ? 'T' : '' }} {{ item.investments.length ? 'I' : '' }} {{ item.liquidations.length ? 'L' : '' }}</span>
          </template>
          <template v-slot:[`item.days`]="{ item }">
            <span :class="getStyle(item)">{{ differenceInDays($store.getters.getUtcDate(item.updatedAt), new Date(item.coinUpdatedAt)) }}</span>
          </template>
          <template v-slot:[`item.usdAmount`]="{ item }">
            <span :class="getStyle(item)">{{ getAsCurrency(parseFloat(item.usdAmount)) }}</span>
          </template>
          <template v-slot:[`item.profit`]="{ item }">
            <v-chip v-if="getStyle(item) === 'liquidated'" color="gray" class="liquidated" style="width:70px;justify-content:center" light>{{ getAsCurrency(getGainLoss(item)) }}</v-chip>
            <v-chip v-else :color="getGainLoss(item) > 0 ? '#4CAF50' : getGainLoss(item) === 0 ? '#FAFAFA' : '#F44336'" style="width:70px;justify-content:center" light>{{ getAsCurrency(getGainLoss(item)) }}</v-chip>
          </template>
        </v-data-table>
      </v-col>
      <v-col lg="3" md="12">
        <v-row>
          <v-col lg="12" sm="12">
            <v-data-table dark hide-default-footer dense disable-pagination :items="swapData" item-key="coin" class="elevation-10"
              :headers="[{ text: 'Coin', value: 'coin' },{ text: 'Amount', value: 'amount' },{ text: 'Value', value: 'value' },{ text: 'Profit', value: 'origValue' }]">
              <template v-slot:[`item.value`]="{ item }">
                <span>{{ getAsCurrency(item.value) }}</span>
              </template>
              <template v-slot:[`item.origValue`]="{ item }">
                <span>{{ (((item.value - item.origValue) / item.origValue) * 100).toFixed(2) }}%</span>
              </template>
            </v-data-table>
          </v-col>
          <v-col lg="12" sm="12" class="mt-1">
            <v-data-table dark hide-default-footer dense disable-pagination :items="sellData" item-key="year" class="elevation-10"
              :headers="[{ text: 'Year', value: 'year' },{ text: 'Short', value: 'shortTerm' },{ text: 'Long', value: 'longTerm' },{ text: '$$$', value: 'dollars' }]" />
          </v-col>
        </v-row>               
      </v-col>
    </v-row>

    <v-dialog v-if="activeRow" v-model="showDetailsDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">Liquidation Details {{ formatDate(activeRow.updatedAt) }}</span>
        </v-card-title>
        <v-card-text>
          <span v-if="activeRow.taxes.length">
            <h3>Taxes</h3>
            <v-data-table dark hide-default-footer dense disable-pagination :items="activeRow.taxes" item-key="id" class="elevation-10"
                :headers="[{ text: 'Acquired', value: 'updatedAt' },{ text: 'Amount', value: 'amount' },{ text: 'Value', value: 'value' }]">
              <template v-slot:[`item.value`]="{ item }">
                <span>{{ getAsCurrency(parseFloat(item.value)) }}</span>
              </template>
              <template v-slot:[`item.updatedAt`]="{ item }">
                <span>{{ formatDate(item.updatedAt) }}</span>
              </template>
            </v-data-table>
          </span>
          <span v-if="activeRow.rewards.length">
            <h3>Rewards</h3>
            <v-data-table dark hide-default-footer dense disable-pagination :items="activeRow.rewards" item-key="id" class="elevation-10"
                :headers="[{ text: 'Acquired', value: 'updatedAt' },{ text: 'Amount', value: 'amount' },{ text: 'Value', value: 'value' }]">
              <template v-slot:[`item.value`]="{ item }">
                <span>{{ getAsCurrency(parseFloat(item.value)) }}</span>
              </template>
              <template v-slot:[`item.updatedAt`]="{ item }">
                <span>{{ formatDate(item.updatedAt) }}</span>
              </template>
            </v-data-table>
          </span>
          <span v-if="activeRow.investments.length">
            <h3>Investments</h3>
            <v-data-table dark hide-default-footer dense disable-pagination :items="activeRow.investments" item-key="id" class="elevation-10"
                :headers="[{ text: 'Acquired', value: 'updatedAt' },{ text: 'Amount', value: 'amount' },{ text: 'Spent', value: 'spent' }]">
              <template v-slot:[`item.spent`]="{ item }">
                <span>{{ getAsCurrency(parseFloat(item.spent)) }}</span>
              </template>
              <template v-slot:[`item.updatedAt`]="{ item }">
                <span>{{ formatDate(item.updatedAt) }}</span>
              </template>
            </v-data-table>
          </span>
          <span v-if="activeRow.liquidations.length">
            <h3>Liquidations</h3>
            <v-data-table dark hide-default-footer dense disable-pagination :items="activeRow.liquidations" item-key="id" class="elevation-10"
                :headers="[{ text: 'Liquidated', value: 'updatedAt' },{ text: 'Amount', value: 'newCoinAmount' },{ text: 'Value', value: 'usdAmount' }]">
              <template v-slot:[`item.usdAmount`]="{ item }">
                <span>{{ getAsCurrency(parseFloat(item.usdAmount)) }}</span>
              </template>
              <template v-slot:[`item.updatedAt`]="{ item }">
                <span>{{ formatDate(item.updatedAt) }}</span>
              </template>
            </v-data-table>
          </span>
          <h3 class="mt-2" v-if="activeRow.event === 'Swap'">{{ activeRow.coin }} {{ activeRow.coinAmount }}</h3>
          <h3 class="mt-2" v-if="activeRow.event === 'Swap'">{{ activeRow.newCoin }} {{ activeRow.newCoinAmount }}</h3>
          <h3 class="mt-2" v-if="activeRow.event === 'Sell'">{{ getAsCurrency(parseFloat(activeRow.usdAmount)) }}</h3>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="activeRow = undefined">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showLiquidationDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">New Liquidation Event</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="2">
                <v-select label="Event" v-model="liqData.event" :items="['Sell', 'Swap']" />
              </v-col>
              <v-col cols="3">
                <v-dialog ref="dialog" v-model="dateModal" :return-value.sync="liqData.updatedAt" persistent width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="liqData.updatedAt" label="Liquidation Date" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" />
                  </template>
                  <v-date-picker v-model="liqData.updatedAt" scrollable>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="dateModal = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.dialog.save(liqData.updatedAt)">OK</v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-col>
              <v-col cols="3">
                <v-text-field v-model="liqData.usdAmount" label="$ Proceeds" />
              </v-col>
              <v-col cols="2">
                {{ toLiquidate.coin !== '' ? toBeLiquidated.filter(r => r.coin === toLiquidate.coin).slice(0, toLiquidate.amount).map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next, 0).toFixed(8) : '' }}
              </v-col>
              <v-col cols="2">
                Old Value<br />{{ toLiquidate.coin !== '' ? getAsCurrency(toBeLiquidated.filter(r => r.coin === toLiquidate.coin).slice(0, toLiquidate.amount).map(item => parseFloat(item.value)).reduce((prev, next) => prev + next, 0)) : '' }}
              </v-col>

              <v-col cols="3" v-if="liqData.event === 'Swap'">
                <v-select @change="changeNewCoin" label="New Coin" v-model="liqData.newCoin" :items="this.$store.state.interests.map(r => r.name)" />
              </v-col>
              <v-col cols="3" v-if="liqData.event === 'Swap'">
                <v-text-field v-model="liqData.newCoinAmount" label="New Coin Amount" />
              </v-col>
              <v-col cols="6" v-if="liqData.event === 'Swap'" />

              <v-col cols="2">
                <v-select dense @change="toLiquidate.amount = 0" label="Coin" v-model="toLiquidate.coin" :items="$store.state.interests.filter(r => r.nickName !== '').map(r => r.name)" />
              </v-col>
              <v-col cols="10">
                <v-slider always-dirty ticks="always" tick-size="4" @change="setUsdAmount()" min="0" :max="0 || toBeLiquidated.filter(r => r.coin === toLiquidate.coin).length" thumb-label="always" v-model="toLiquidate.amount">
                  <template v-slot:prepend>
                    <v-icon @click="toLiquidate.amount--;setUsdAmount()">mdi-minus</v-icon>
                  </template>
                  <template v-slot:append>
                    <v-icon @click="toLiquidate.amount++;setUsdAmount()">mdi-plus</v-icon>
                  </template>
                </v-slider>
              </v-col>

            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click.stop="Object.assign($data.liqData, $options.data().liqData);Object.assign($data.toLiquidate, $options.data().toLiquidate);showLiquidationDialog=false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveLiquidation">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { differenceInDays, differenceInYears } from 'date-fns'
import { addLiquidation } from '../api/apollo'
export default {
  data: () => ({
    activeRow: undefined,
    showDetailsDialog: false,
    dateModal: false,
    liqData: {
      updatedAt: new Date().toISOString().substr(0, 10),
      event: 'Swap',
      taxable: true,
      usdAmount: '0',
      newCoin: 'BTC',
      newCoinAmount: '',
    },
    toLiquidate: {
      coin: '',
      amount: 0
    },
    showLiquidationDialog: false,
    sortBy: 'updatedAt',
    sortDesc: true,
    swapData: [],
    sellData: [],
    toBeLiquidated: [],
    headers: [
      { text: 'Updated At', sortable: true, value: 'updatedAt' },
      { text: 'Source', sortable: false, value: 'type' },
      { text: 'Event', sortable: false, value: 'event' },
      { text: 'Coin', sortable: false, value: 'coin' },
      { text: 'Days', sortable: false, value: 'days' },
      { text: 'New Amount', sortable: false, value: 'newCoinAmount' },
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
    },
    activeRow() {
      this.showDetailsDialog = this.activeRow
    }
  },
  computed: {
    liquidations() {
      return this.$store.state.allLiquidation
    },
  },
  methods: {
    getStyle(item) {
      return (item.liquidation && item.liquidation !== null) ? 'liquidated' : ''
    },
    async saveLiquidation() {
      let filteredLiquidated = this.toBeLiquidated.filter(r => r.coin === this.toLiquidate.coin).slice(0, this.toLiquidate.amount)
      this.liqData.rewards = filteredLiquidated.filter(r => r.source === "rewards").map(r => r.id)
      this.liqData.taxes = filteredLiquidated.filter(r => r.source === "taxes").map(r => r.id)
      this.liqData.investments = filteredLiquidated.filter(r => r.source === "investments").map(r => r.id)
      this.liqData.liquidations = filteredLiquidated.filter(r => r.source === "liquidations").map(r => r.id)

      let liqu = await addLiquidation(this.liqData)
      if(liqu.event === 'Sell') {
        delete liqu.newCoin
        delete liqu.newCoinAmount
      }
      
      this.$store.commit('addLiquidation', liqu)
      this.$store.commit('updateLiqItems', liqu)

      Object.assign(this.$data.liqData, this.$options.data().liqData)
      Object.assign(this.$data.toLiquidate, this.$options.data().toLiquidate)
      this.showLiquidationDialog = false
    },
    setUsdAmount() {
      let price = $cookies.get(this.toLiquidate.coin) || 0
      this.liqData.usdAmount = (price * this.toBeLiquidated.filter(r => r.coin === this.toLiquidate.coin).slice(0, this.toLiquidate.amount).map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next, 0)).toFixed(2)
      let newCoinPrice = $cookies.get(this.liqData.newCoin) || 0
      this.liqData.newCoinAmount = (this.liqData.usdAmount / newCoinPrice).toFixed(8)
    },
    async changeNewCoin(newCoin) {
      const newCoinPrice = await $cookies.get(newCoin)
      this.liqData.newCoinAmount = newCoinPrice === null ? 0 : (this.liqData.usdAmount / newCoinPrice).toFixed(8)
    },
    createTables() {
      this.swapData = []
      this.sellData = []
      this.toBeLiquidated = []
      new Set(this.liquidations.filter(l => l.newCoin && l.newCoin !== null).map(l => l.newCoin)).forEach(c => {
        let coinCookie = $cookies.get(c) || 0
        let amount = this.liquidations.filter(t => t.event === 'Swap' && t.newCoin === c && t.liquidation === null).map(item => parseFloat(item.newCoinAmount)).reduce((prev, next) => prev + next, 0)
        let origValue = this.liquidations.filter(t => t.event === 'Swap' && t.newCoin === c && t.liquidation === null).map(item => parseFloat(item.coinValue)).reduce((prev, next) => prev + next, 0)
        this.swapData.push( { coin: c, amount: amount.toFixed(8), value: amount * coinCookie, origValue: origValue } )
      })
      let amount = this.liquidations.filter(t => t.event === 'Sell').map(item => parseFloat(item.usdAmount)).reduce((prev, next) => prev + next, 0)
      this.swapData.push( { coin: '$$$', amount: amount.toFixed(2), value: amount, origValue: amount } )

      new Set(this.liquidations.map(l => l.updatedAt.substring(0,4))).forEach(c => {
        let shortTerm = this.liquidations.filter(t => t.updatedAt.substring(0,4) === c && Math.abs(differenceInYears(new Date(t.updatedAt), new Date(t.coinUpdatedAt))) === 0).map(item => parseFloat(item.usdAmount)).reduce((prev, next) => prev + next, 0) -
          this.liquidations.filter(t => t.updatedAt.substring(0,4) === c && Math.abs(differenceInYears(new Date(t.updatedAt), new Date(t.coinUpdatedAt))) === 0).map(item => parseFloat(item.coinValue)).reduce((prev, next) => prev + next, 0) 
        let longTerm = this.liquidations.filter(t => t.updatedAt.substring(0,4) === c && Math.abs(differenceInYears(new Date(t.updatedAt), new Date(t.coinUpdatedAt))) >= 1).map(item => parseFloat(item.usdAmount)).reduce((prev, next) => prev + next, 0) -
          this.liquidations.filter(t => t.updatedAt.substring(0,4) === c && Math.abs(differenceInYears(new Date(t.updatedAt), new Date(t.coinUpdatedAt))) >= 1).map(item => parseFloat(item.coinValue)).reduce((prev, next) => prev + next, 0)
        
        let dollars = this.liquidations.filter(t => t.updatedAt.substring(0,4) === c && t.event === 'Sell').map(item => parseFloat(item.usdAmount)).reduce((prev, next) => prev + next, 0)

        this.sellData.push({ year: c, shortTerm: this.getAsCurrency(shortTerm), longTerm: this.getAsCurrency(longTerm), dollars: this.getAsCurrency(dollars) })
      })

      this.$store.state.interests.filter(r => r.nickName !== '').map(r => r.name).forEach(i => {
        let rewards = this.$store.state.allRewards.filter(r => r.liquidation === null && r.coin === i).map(r => { return { coin: i, amount: r.amount, updatedAt: r.updatedAt, value: r.value, exchangeId: r.exchangeId, id: r.id, source: "rewards" }})
        let taxes = this.$store.state.allTaxes.filter(r => r.liquidation === null && r.coin === i).map(r => { return { coin: i, amount: r.amount, updatedAt: r.updatedAt, value: r.value, exchangeId: r.exchangeId, id: r.id, source: "taxes" }})
        let investments = this.$store.state.allInvestments.filter(r => r.liquidation === null && r.coin === i).map(r => { return { coin: i, amount: r.amount, updatedAt: r.updatedAt, value: r.spent, id: r.id, source: "investments" }})
        let filteredLiqs = this.liquidations.filter(r => r.event === 'Swap' && r.liquidation === null && r.newCoin === i).map(r => { return { coin: i, amount: r.newCoinAmount, updatedAt: r.updatedAt, value: r.usdAmount, id: r.id, source: "liquidations" }})
        this.toBeLiquidated.push(...rewards, ...taxes, ...investments, ...filteredLiqs)
        this.toBeLiquidated.sort((d1, d2) => new Date(d1.updatedAt).getTime() - new Date(d2.updatedAt).getTime())
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
      return parseFloat(item.usdAmount) - item.coinValue
    }, differenceInDays
  }
}
</script>
<style>
  .liquidated {
    text-decoration: line-through
  }
</style>