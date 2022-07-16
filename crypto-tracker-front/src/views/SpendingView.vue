<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <month-picker :trxs="allTrxs" @monthClick="onMonthClick" />
      </v-col>
      <v-col cols="6">
        <spending-table :trxs="trxs" :monthNameActive="monthNameActive" :merchantNames="merchantNames" @trxUpdated="onTrxUpdated" @refreshTrx="onRefreshTrx" />
      </v-col>
      <v-col cols="5">
        <v-row no-gutters class="pt-1">
          <v-expansion-panels accordion dark multiple v-model="panel">
            <v-expansion-panel v-model="panel">
              <v-expansion-panel-header>Checking & Investments</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row no-gutters>
                  <v-col lg="6" sm="12">
                    <checking-input @removeItem="onRemoveItem" @saveItem="onSaveItem" :items="checkings" type="checkingIn" />
                  </v-col>
                  <v-col lg="6" sm="12">
                    <checking-input @removeItem="onRemoveItem" @saveItem="onSaveItem" :items="checkings" type="checkingOut" />
                  </v-col>
                  <v-col lg="6" sm="12">
                    <checking-input @removeItem="onRemoveItem" @saveItem="onSaveItem" :items="checkings" type="investments" />
                  </v-col>
                  <v-col lg="6" sm="12">
                    <v-card class="ma-1" dark>
                      <v-card-text class="subtitle-1 pa-3 d-flex">
                        <div style="flex: 0 0 50%;">
                          <div class="pb-1">Card: <span class="red--text">{{ getAsCurrency(getCardSpent) }}</span></div>
                          <div>Total: <span class="red--text">{{ getAsCurrency(getTotalSpent) }}</span></div>
                        </div>
                        <div>
                          <div class="pb-1">Total: <span class="green--text">{{ getAsCurrency(getTotalSaved) }}</span></div>
                          <div>USDC: <span class="green--text">{{ getAsCurrency(getUsdcSaved) }}</span></div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
            <v-expansion-panel-header>Spending</v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row no-gutters>
                  <v-col lg="6" xs="12" class="pa-1">
                    <v-data-table
                      @click:row="categoryClick"
                      single-select
                      dark
                      hide-default-footer
                      dense
                      disable-pagination
                      :headers="categoryHeaders"
                      :items="categorySpending"
                      item-key="category"
                      class="elevation-10 row-pointer">
                      <template v-slot:[`item.spending`]="{ item }">
                        <div class="rounded text-center" :style="getBackgroundColor(item)">
                          <span class="black--text">{{ getAsCurrency(item.spending) }}</span>
                        </div>
                      </template>
                      <template v-slot:[`item.avg`]="{ item }">
                        <span>{{ getAsCurrency(item.avg) }}</span>
                      </template>
                    </v-data-table>
                  </v-col>
                  <v-col lg="6" xs="12" class="pa-1">
                    <section style="display:flex;flex-direction:column;height:539px;">
                      <v-card style="display:flex;overflow:hidden;">
                        <v-data-table
                          @click:row="merchantClick"
                          single-select
                          style="width:100%"
                          fixed-header
                          disable-pagination
                          dark
                          hide-default-footer
                          dense
                          :headers="merchantHeaders"
                          :items="merchantSpending"
                          item-key="merchant"
                          class="elevation-10 flex-table d-flex row-pointer">
                          <template v-slot:[`item.amount`]="{ item }">
                            <span>{{ getAsCurrency(item.amount) }}</span>
                          </template>
                          <template v-slot:[`item.merchant`]="{ item }">
                            <span v-if="item.merchant && item.merchant.length < 16">{{ item.merchant }}</span>
                            <span v-else>{{ `${item.merchant ? item.merchant.substring(0,16) : ''}  ...` }}</span>
                          </template>
                        </v-data-table>
                      </v-card>
                    </section>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-col lg="12">
            <pie :trxs="trxs" class="mt-3"/>
          </v-col>
          <v-col lg="12">
            <bar :allTrxs="allTrxs" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SpendingTable from '../components/spending/SpendingTable'
import MonthPicker from '../components/shared/MonthPicker'
import Pie from '../components/spending/charts/Pie'
import Bar from '../components/spending/charts/Bar'
import CheckingInput from '../components/spending/CheckingInput'
import { getTrxs, getChecking, deleteChecking, addChecking, updateChecking } from '../api/apollo'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import endOfMonth from 'date-fns/endOfMonth'
import isWithinInterval from 'date-fns/isWithinInterval'
import { refreshTrxs } from '../api/endpoints/trx'
import chroma from "chroma-js";
import dateMixin from '@/mixins/datesMixin'
export default {
  components: {
    SpendingTable,
    MonthPicker,
    Pie,
    Bar,
    CheckingInput
  },
  mixins: [dateMixin],
  data: () => ({
    allTrxs: [],
    trxs: [],
    allChecking: [],
    checkings: [],
    merchantNames: [],
    averages: [],
    categorySpending: [],
    merchantSpending: [],
    selectedRow: undefined,
    monthNameActive: '',
    categoryHeaders: [
      { text: 'Category', sortable: false, value: 'category' },
      { text: 'Spend', sortable: false, value: 'spending' },
      { text: 'Avg', sortable: false, value: 'avg' }
    ],
    merchantHeaders: [
      { text: 'Merchant', sortable: false, value: 'merchant' },
      { text: 'Amt', sortable: true, value: 'amount' }
    ],
    panel: [0]
  }),
  created() {
    this.loadTrxs()
  },
  computed: {
    getCardSpent() {
      return this.trxs.map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next, 0)
    },
    getTotalSpent() {
      return this.getCardSpent + 
        this.checkings.filter(i => i.type === 'checkingOut' || i.type === 'investments').map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next, 0)
    },
    getTotalSaved() {
      return (this.checkings.filter(i => i.type === 'checkingIn').map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next, 0))
        - (this.getCardSpent +  this.checkings.filter(i => i.type === 'checkingOut').map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next, 0))
    },
    getUsdcSaved() {
      return this.checkings.filter(i => i.type === 'checkingIn').map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next, 0) - this.getTotalSpent
    }
  },
  methods: {
    async onRefreshTrx(callback) {
      let res = await refreshTrxs()
      if(res.status === 200) {
        this.loadTrxs()
        callback("done")
      } else {
        alert("PROBLEM")
      }
    },
    loadTrxs() {
      Promise.all([getTrxs(), getChecking()]).then(values => {
        this.allTrxs = [...values[0]]
        this.allChecking = [...values[1]]
        this.merchantNames = this.allTrxs.filter(t => t.merchant !== null).map(({merchant}) => merchant)

        this.onMonthClick(this.monthNameActive !== '' ? this.monthNameActive : {month: new Date().getUTCMonth(), year: new Date().getUTCFullYear()})
      })
    },
    onMonthClick(dateMonth) {
      if(this.selectedRow !== undefined) {
        this.selectedRow.select(false)
      }
      this.monthNameActive = dateMonth

      if(dateMonth === 'ALL') {
        this.trxs = this.allTrxs
        this.checkings = this.allChecking
        this.getCategorySpending()
      } else {
        this.trxs = this.allTrxs.filter(t => this.dateIsInRange(t.updatedAt, dateMonth))
        this.checkings = this.allChecking.filter(q => this.dateIsInRange(q.date, dateMonth))
        this.getCategorySpending(dateMonth)
      }

      this.getMerchantSpending()
    },
    onTrxUpdated(item) {
      this.$set(this.allTrxs, this.allTrxs.indexOf(t => t.id === item.id), item);
      this.onMonthClick(this.monthNameActive)
    },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    onRemoveItem(item) {
      this.allChecking.splice(this.allChecking.indexOf(item), 1)
      this.checkings.splice(this.checkings.indexOf(item), 1)
      deleteChecking(item.id)
    },
    onSaveItem(item) {
      if(item.id !== undefined) {
        updateChecking(item)
        Object.assign(this.allChecking[this.allChecking.findIndex(f => f.id === item.id)], item)
        Object.assign(this.checkings[this.checkings.findIndex(f => f.id === item.id)], item)
      } else {
        addChecking(item).then(i => {
          this.allChecking.push(i)
          this.checkings.push(i)
        })
      }
    },
    getCategorySpending(dateMonth) {
      this.categorySpending = []
      const monthInterval = eachMonthOfInterval({start: new Date(new Date().getUTCFullYear(), 0, 1), end: new Date(new Date().getUTCFullYear(), 11, 1) })
    
      let spendingArr = []
      monthInterval.forEach(d => { spendingArr.push({
        dateMonth: d.getMonth(),
        categories: [...this.$store.getters.getCategories.map(c => { return { category: c, total: 
          this.allTrxs.filter(t => isWithinInterval(new Date(t.updatedAt), { start: d, end: endOfMonth(d) }) && t.category === c)
            .map(({amount}) => parseFloat(amount))
            .reduce((prev, next) => prev + next, 0)
          }})]
      })})

      let averageArr = []
      monthInterval.forEach(d => { this.$store.getters.getCategories.forEach(c => { averageArr.push({
        category: c, dateMonth: d.getMonth(), avg: spendingArr.filter(date => date.dateMonth <= d.getMonth())
          .map(({categories}) => categories).flat()
          .filter(f => f.category === c)
          .map(({total}) => parseFloat(total))
          .reduce((avg, value, _, { length }) => avg + value / length, 0)
      })})})

      this.$store.getters.getCategories.forEach(c => {
        if(dateMonth) {
          this.categorySpending.push({ category: c, 
            spending: spendingArr.find(d => d.dateMonth === dateMonth.month).categories.find(cat => cat.category === c).total,
            avg: averageArr.find(d => d.dateMonth === dateMonth.month && d.category === c).avg
          })
        } else {
          this.categorySpending.push({ category: c, 
            spending: spendingArr.map(s => s.categories).flat().filter(cat => cat.category === c).map(({total}) => parseFloat(total)).reduce((prev, next) => prev + next, 0),
            avg: averageArr.filter(d => d.category === c).map(({avg}) => parseFloat(avg)).reduce((avg, value, _, { length }) => avg + value / length, 0)
          })
        }
      })
    },
    getMerchantSpending() {
      this.merchantSpending = []
      this.trxs.map(({merchant}) => merchant).forEach(m => {
        if(!this.merchantSpending.some(merch => merch.merchant === m)) {
          this.merchantSpending.push({ merchant: m,
            amount: this.trxs.filter(t => t.merchant === m).map(({amount}) => parseFloat(amount)).reduce((prev, next) => prev + next, 0)
          })
        }
      })
      this.merchantSpending.sort((a,b) => b.amount - a.amount);
    },
    getBackgroundColor(item) {
      let val = (item.spending !== 0 || item.avg !== 0) ? item.spending / item.avg : 0
      let scale = chroma.scale(['#4CAF50', '#FAFAFA', '#F44336']).domain([0,2])
      return `background-color: ${ scale(val).hex() }`
    },
    categoryClick(e, row) {
      if(this.selectedRow !== undefined) {
        this.selectedRow.select(false)
      }
      row.select(true)

      if(this.trxs.every(t => t.category === e.category)) {
        row.select(false)
        if(this.monthNameActive === 'ALL') {
          this.trxs = this.allTrxs
        } else {
          this.trxs = this.allTrxs.filter(t => this.dateIsInRange(t.updatedAt, this.monthNameActive))
        }
      } else {
        if(this.monthNameActive === 'ALL') {
          this.trxs = this.allTrxs.filter(t => t.category === e.category)
        } else {
          this.trxs = this.allTrxs.filter(t => this.dateIsInRange(t.updatedAt, this.monthNameActive) && t.category === e.category)
        }
      }
      this.selectedRow = row
    },
    merchantClick(e, row) {
      if(this.selectedRow !== undefined) {
        this.selectedRow.select(false)
      }
      row.select(true)

      if(this.trxs.every(t => t.merchant === e.merchant)) {
        row.select(false)
        if(this.monthNameActive === 'ALL') {
          this.trxs = this.allTrxs
        } else {
          this.trxs = this.allTrxs.filter(t => this.dateIsInRange(t.updatedAt, this.monthNameActive))
        }
      } else {
        if(this.monthNameActive === 'ALL') {
          this.trxs = this.allTrxs.filter(t => t.merchant === e.merchant)
        } else {
          this.trxs = this.allTrxs.filter(t => this.dateIsInRange(t.updatedAt, this.monthNameActive) && t.merchant === e.merchant)
        }
      }
      this.selectedRow = row
    }
  }
}
</script>
<style>
.flex-table > div {
  width: 100%;
}
.row-pointer > .v-data-table__wrapper > table > tbody > tr:hover { 
  cursor: pointer;
}
</style>