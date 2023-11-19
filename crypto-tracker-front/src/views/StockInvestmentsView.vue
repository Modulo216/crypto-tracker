<template>
  <v-container fluid>
    <v-row>
      <v-col cols="3">
        <v-data-table
          dark
          dense
          hide-default-header
          :loading="loadingInvestments"
          :sort-by.sync="sortBy" 
          :sort-desc.sync="sortDesc"
          :headers="[{text:'Updated At',value:'updatedAt'},{text:'Symbol',value:'stockSymbol' },
            {text:'Total',value:'total'},{text:'Amount',value:'amount'},{text:'Value',value:'value'}]"
          :items="mainTableItems"
          item-key="id"
          class="elevation-10" hide-default-footer disable-pagination
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>
                <v-select style="max-width:90px" dense label="Year" v-model="selectedYear" :items="['ALL', ...Array.from(new Set($store.state.allStockInvestments.map(t => t.updatedAt.slice(0,4))))]" />
              </v-toolbar-title>
              <v-spacer />
              <v-btn color="primary" dark @click="refreshHistory" :loading="loadingInvestments" :disabled="loadingInvestments || (stockPriceHistory.length > 0 && stockPriceHistory[stockPriceHistory.length-1].updatedAt.slice(0, 10) === formatISO(new Date()).slice(0, 10))">
                <v-icon dark>
                  mdi-refresh
                </v-icon>
              </v-btn>
              <v-btn color="primary" dark class="ml-2" @click="showAddDialog = true" :disabled="loadingInvestments">
                <v-icon dark>
                  mdi-plus-thick
                </v-icon>
              </v-btn>
              <download-excel :data="$store.state.allStockInvestments">
                <v-btn color="primary" dark class="ml-2">
                  <v-icon dark>
                    mdi-download
                  </v-icon>
                </v-btn>
              </download-excel>
            </v-toolbar>
          </template>
          <template v-slot:[`item.updatedAt`]="{ item }">
            <span>{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template v-slot:[`item.total`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div style="cursor: pointer" v-bind="attrs" v-on="on">
                  <span :class="item.spent + item.match < 0 ? 'red--text' : ''">{{ getAsCurrency(item.spent + item.match) }}</span>
                </div>
              </template>
              <div>Spent: {{ getAsCurrency(item.spent) }}</div>
              <div>Match: {{ getAsCurrency(item.match) }}</div>
            </v-tooltip>
          </template>
          <template v-slot:[`item.amount`]="{ item }">
            <span :class="item.amount < 0 ? 'red--text' : ''">{{ (item.amount).toFixed(2) }}</span>
          </template>
          <template v-slot:[`item.value`]="{ item }">
            <span :class="(item.spent > 0 && item.value) < (item.spent + item.match) ? 'red--text' : ''">{{ getAsCurrency(item.value) }}</span>
          </template>
        </v-data-table>      
      </v-col>
      <v-col cols="9">
        <v-data-table
          @click:row="homeStockClick"
          single-select
          dark
          hide-default-footer
          dense
          disable-pagination
          :headers="[{ text: 'Symbol', value: 'symbol' },{ text: 'Spent', value: 'spent' },{ text: 'Match', value: 'match' },{ text: 'Total', value: 'total' },{ text: 'Fees', value: 'fees' },{ text: 'Amount', value: 'amount' },{ text: 'Value', value: 'value' },{ text: 'Gain', value: 'gain' }]"
          :items="symbolTable"
          item-key="stockSymbol"
          class="elevation-10 row-pointer mb-3"
        >
        <template v-slot:[`item.gain`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div style="cursor: pointer" v-bind="attrs" v-on="on">
                {{ item.gain }}
              </div>
            </template>
            <span>{{item.realGain}}</span>
          </v-tooltip>
        </template>
        </v-data-table>
        <history-line />
      </v-col>
    </v-row>

    <v-dialog v-model="showAddDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">New Stock Investment Event</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="4">
                <v-select label="Kind" v-model="defaultItem.kind" :items="['Buy', 'Fee']" />
              </v-col>
              <v-col cols="4">
                <v-dialog ref="dialog" v-model="dateModal" :return-value.sync="defaultItem.updatedAtView" persistent width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="defaultItem.updatedAtView" label="Date" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" />
                  </template>
                  <v-date-picker v-model="defaultItem.updatedAtView" scrollable>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="dateModal = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.dialog.save(defaultItem.updatedAtView)">OK</v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-col>
              <v-col cols="4">
                <v-select label="Symbol" v-model="defaultItem.stockSymbol" :items="this.$store.state.stocks.map(r => r.name)" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="defaultItem.spent" label="$ Spent" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="defaultItem.match" label="$ Match" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="defaultItem.amount" label="Stock Amount" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click.stop="Object.assign($data.defaultItem, $options.data().defaultItem);showAddDialog=false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="addNew()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog color="#E1F5FE" v-model="smallStockDialog" max-width="1500px">
      <small-stock-line :stockName="smallStockName" />
    </v-dialog>
    <v-snackbar v-model="snackbar" :timeout="3000">
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
const { formatISO, endOfYesterday } = require('date-fns')
import { refreshStockPriceHistory } from '../api/endpoints/priceHistory'
import { addStockInvestment } from '../api/apollo'
import SmallStockLine from '@/components/stockInvestments/SmallStockLine'
import HistoryLine from '@/components/stockInvestments/HistoryLine'
import chroma from "chroma-js";
  export default {
    name: 'StockInvestmentsView',
    data: () => ({
      loadingInvestments: false,
      sortBy: 'updatedAt',
      sortDesc: true,
      showAddDialog: false,
      dateModal: false,
      defaultItem: {
        updatedAtView: formatISO(new Date()).slice(0, 10),
        kind: 'Buy',
        stockSymbol: '',
        spent: 0,
        match: 0,
        amount: 0
      },
      symbolTable: [],
      selectedYear: 'ALL',
      smallStockDialog: false,
      smallStockName: '',
      snackbar: false,
      snackbarText: ''
    }),
    components: {
      SmallStockLine,
      HistoryLine
    },
    created() {
      if(this.$store.state.allStockInvestments && this.$store.state.stockPrices) {
        this.loadTables()
      }
    },
    computed: {
      mainTableItems() {
        let items = this.selectedYear === 'ALL' ? this.stockInvestments : this.stockInvestments.filter(t => t.updatedAt.slice(0,4) === this.selectedYear)

        const lastHistory = this.stockPriceHistory[this.stockPriceHistory.length-1]
        for(const item of items) {
          let itemPrice = lastHistory.prices.find(p => p.symbol === item.stockSymbol)
          let price = itemPrice ? itemPrice.price : 0.0
          item.value = item.amount * price
        }
        return items
      },
      stockPriceHistory() {
        return this.$store.state.stockPrices
      },
      stockInvestments() {
        return this.$store.state.allStockInvestments
      }
    },
    watch: {
      stockInvestments(newVal) {
        if(this.stockPriceHistory.length > 0) {
          this.loadTables()
        }
      },
      stockPriceHistory(newVal) {
        if(this.stockInvestments.length > 0) {
          this.loadTables()
        }
      },
      snackbarText(newVal) {
        this.snackbar = true
      }
    },
    methods: {
      loadTables() {
        this.symbolTable = []
        const lastHistory = this.stockPriceHistory[this.stockPriceHistory.length-1]
        new Set(this.stockInvestments.map(t => t.stockSymbol)).forEach(t => {
          let itemPrice = lastHistory.prices.find(p => p.symbol === t)
          let spent = this.stockInvestments.filter(f => f.kind === 'Buy' && f.stockSymbol === t).map(f => f.spent).reduce((prev, next) => prev + next, 0)
          let match = this.stockInvestments.filter(f => f.kind === 'Buy' && f.stockSymbol === t).map(f => f.match).reduce((prev, next) => prev + next, 0)
          let amount = this.stockInvestments.filter(f => f.stockSymbol === t).map(f => f.amount).reduce((prev, next) => prev + next, 0)
          let value = this.stockInvestments.filter(f => f.stockSymbol === t).map(f => f.amount).reduce((prev, next) => prev + next, 0) * (itemPrice ? itemPrice.price : 0.0)
          let fees = this.stockInvestments.filter(f => f.kind === 'Fee' && f.stockSymbol === t).map(f => f.spent).reduce((prev, next) => prev + next, 0)
          this.symbolTable.push({ symbol: t, spent: this.getAsCurrency(spent), match: this.getAsCurrency(match), amount: (amount).toFixed(3), value: this.getAsCurrency(value), fees: this.getAsCurrency(Math.abs(fees)),
            total: this.getAsCurrency(spent + match), gain: `${(value / (spent + match)).toFixed(3)} %`, realGain: `${((value / (spent) * 100)).toFixed(2)} %` })
        })
      },
      async refreshHistory() {
        this.loadingInvestments = true
        let resp = await refreshStockPriceHistory(this.stockPriceHistory.slice(-30).map(p => p.updatedAt.slice(0,10)))
        this.$store.commit('addStockHistoryMany', resp.data)
        this.snackbarText = `Added ${resp.data.length} entries. ${new Date().toLocaleTimeString()}`
        this.loadingInvestments = false
      },
      getAsCurrency(numb) {
        return numb.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })
      },
      formatDate(d) {
        let theDate = new Date(d)
        return ("0" + (theDate.getMonth() + 1)).slice(-2) + '/' + ("0" + theDate.getDate()).slice(-2) +
          '/' + theDate.getFullYear().toString().slice(-2)
      },
      homeStockClick(row) {
        this.smallStockDialog = true
        this.smallStockName = row.symbol
      },
      async addNew() {
        this.defaultItem.updatedAt = new Date(this.defaultItem.updatedAtView + ` ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`).toISOString()
        delete this.defaultItem.updatedAtView
        let item = await addStockInvestment(this.defaultItem)
        this.$store.commit('addStockInvestment', item)
        this.showAddDialog = false
        Object.assign(this.$data.defaultItem, this.$options.data().defaultItem)
      }, formatISO, endOfYesterday
    }
  }
</script>
