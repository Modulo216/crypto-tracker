<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <month-picker :trxs="allTrxs" @monthClick="onMonthClick" />
      </v-col>
      <v-col cols="6">
        <spending-table :trxs="trxs" :monthActive="monthActive" />
      </v-col>
      <v-col cols="5">
        <spending-input :checkingInItems="checkingInItems" :checkingOutItems="checkingOutItems" :investItems="investItems"  />
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
  import SpendingInput from '@/components/SpendingInput'
  import { getTrxs, getChecking } from '../api/apollo'
  export default {
    components: {
      SpendingTable,
      MonthPicker,
      Pie,
      Bar,
      SpendingInput
    },
    data: () => ({
      allTrxs: [],
      trxs: [],
      allChecking: [],
      monthActive: undefined,
      checkingInItems: [],
      checkingOutItems: [],
      investItems: []
    }),
    created() {
      getTrxs().then(r => {
        this.allTrxs = [...r]
        const date = new Date()
        this.onMonthClick({ monthPlace: date.getMonth(), monthName: this.$store.getters.getMonthNames[date.getMonth()] })
        
        getChecking().then(c => {
          this.allChecking = [...c]

          let items = c.filter(q => new Date(q.date).getMonth() === this.monthActive.monthPlace)
          this.checkingInItems = [...items.filter(c => c.type === "checkingIn")]
          this.checkingOutItems = [...items.filter(c => c.type === "checkingOut")]
          this.investItems = [...items.filter(c => c.type === "investments")] 
        })
      })
    },
    methods: {
      onMonthClick(e) {
        this.monthActive = e
        this.trxs = this.allTrxs.filter(t => new Date(t.updatedAt).getMonth() === e.monthPlace)

        let items = this.allChecking.filter(q => new Date(q.date).getMonth() === this.monthActive.monthPlace)
        this.checkingInItems = [...items.filter(c => c.type === "checkingIn")]
        this.checkingOutItems = [...items.filter(c => c.type === "checkingOut")]
        this.investItems = [...items.filter(c => c.type === "investments")] 
      }
    }
  }
</script>
