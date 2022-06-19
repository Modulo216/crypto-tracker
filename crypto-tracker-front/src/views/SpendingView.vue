<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <month-picker :trxs="allTrxs" @monthClick="onMonthClick" />
      </v-col>
      <v-col cols="6">
        <spending-table :trxs="trxs" :monthNameActive="monthNameActive" />
      </v-col>
      <v-col cols="5">
        <v-row no-gutters>
          <v-col cols="6">
            <spending-input-comp @removeItem="onRemoveItem" @saveItem="onSaveItem" :items="checkings" type="checkingIn" />
          </v-col>
          <v-col cols="6">
            <spending-input-comp @removeItem="onRemoveItem" @saveItem="onSaveItem" :items="checkings" type="checkingOut" />
          </v-col>
          <v-col cols="6">
            <spending-input-comp @removeItem="onRemoveItem" @saveItem="onSaveItem" :items="checkings" type="investments" />
          </v-col>
          <v-col cols="6">
            <div>{{ `Card Spent: ${ getAsCurrency(cardSpend) }` }}</div>
            <div>{{ `Total Spent: ${ getAsCurrency(getTotalSpent) }` }}</div>
          </v-col>
        </v-row>
        <pie />
        <bar />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SpendingTable from '../components/SpendingTable'
import MonthPicker from '../components/MonthPicker'
import Pie from '../components/charts/Pie'
import Bar from '../components/charts/Bar'
import SpendingInputComp from '../components/SpendingInputComp'
import { getTrxs, getChecking, deleteChecking, addChecking, updateChecking } from '../api/apollo'
export default {
  components: {
    SpendingTable,
    MonthPicker,
    Pie,
    Bar,
    SpendingInputComp
  },
  data: () => ({
    allTrxs: [],
    trxs: [],
    allChecking: [],
    checkings: [],
    monthNameActive: '',
    cardSpend: 0
  }),
  created() {
    Promise.all([getTrxs(), getChecking()]).then(values => {
      this.allTrxs = [...values[0]]
      this.allChecking = [...values[1]]
      this.onMonthClick(new Date().getMonth())
    });
  },
  computed: {
    getTotalSpent() {
      return this.cardSpend + 
        (this.checkings.length ? 
        this.checkings.filter(i => i.type === 'checkingOut')
          .map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next) : 0)
    }
  },
  methods: {
    onMonthClick(dateMonth) {
      this.monthNameActive = this.$store.getters.getMonthNames[dateMonth]
      this.trxs = this.allTrxs.filter(t => this.$store.getters.getUtcMonth(t.updatedAt) === dateMonth)
      this.checkings = this.allChecking.filter(q => this.$store.getters.getUtcMonth(q.date) === dateMonth)
      this.cardSpend = this.trxs.map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next)
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
    onSaveItem(item, idx) {
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
    }
  }
}
</script>
