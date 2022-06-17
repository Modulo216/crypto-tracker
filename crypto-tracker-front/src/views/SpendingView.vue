<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <month-picker :trxs="allTrxs" @monthClick="onMonthClick" />
      </v-col>
      <v-col cols="7">
        <spending-table :trxs="trxs" :monthActive="monthActive" />
      </v-col>
      <v-col cols="4">
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
  import { getTrxs } from '../api/apollo'
  export default {
    components: {
      SpendingTable,
      MonthPicker,
      Pie,
      Bar
    },
    data: () => ({
      allTrxs: [],
      trxs: [],
      monthActive: undefined
    }),
    created() {
      getTrxs().then(r => {
        this.allTrxs = [...r]
        const date = new Date()
        this.onMonthClick({ monthPlace: date.getMonth(), monthName: this.$store.getters.getMonthNames[date.getMonth()] })
      })
    },
    methods: {
      onMonthClick(e) {
        this.monthActive = e
        this.trxs = this.allTrxs.filter(t => new Date(t.updatedAt).getMonth() === e.monthPlace)
      }
    }
  }
</script>
