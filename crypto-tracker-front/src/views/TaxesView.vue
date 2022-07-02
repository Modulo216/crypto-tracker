<template>
  <v-container fluid>
    <v-row>
      <v-col cols="1">
        <month-picker :trxs="allTaxes" @monthClick="onMonthClick" />
      </v-col>
      <v-col cols="6">
        <taxes-table :taxes="taxes" :activities="allTaxes.map(t => t.activity)" :coins="allTaxes.map(t => t.coin)" :exchanges="allTaxes.map(t => t.exchange)"
          :monthNameActive="monthNameActive" @taxUpdated="onTaxUpdated" @taxAdded="onTaxAdded" @refreshTax="onRefreshTax" />
      </v-col>
      <v-col cols="5">

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import MonthPicker from '../components/shared/MonthPicker'
import TaxesTable from '../components/taxes/TaxesTable.vue'
import { refreshTaxes } from '../api/endpoints/tax'
import { getTaxes } from '../api/apollo'
export default {
  components: {
    MonthPicker,
    TaxesTable
  },
  data: () => ({
    allTaxes: [],
    taxes: [],
    monthNameActive: '',
  }),
  created() {
    this.loadTaxes()
  },
  methods: {
    async loadTaxes() {
      this.allTaxes = await getTaxes()
      this.onMonthClick(new Date().getMonth())
    },
    onMonthClick(dateMonth) {
      if(dateMonth === 'ALL') {
        this.monthNameActive = 'All'
        this.taxes = this.allTaxes
      } else {
        this.monthNameActive = this.$store.getters.getMonthNames[dateMonth]
        this.taxes = this.allTaxes.filter(t => this.$store.getters.getUtcMonth(t.updatedAt) === dateMonth)
      }
    },
    onTaxUpdated(item) {
      this.$set(this.allTaxes, this.allTaxes.indexOf(t => t.id === item.id), item);
      this.onMonthClick(this.$store.getters.getUtcMonth(item.updatedAt))
    },
    onTaxAdded(item) {
      this.allTaxes.push(item)
      this.onMonthClick(this.$store.getters.getUtcMonth(item.updatedAt))
    },
    async onRefreshTax(callback) {
      let res = await refreshTaxes()
      if(res.status === 200) {
        this.loadTaxes()
        callback("done")
      } else {
        alert("PROBLEM")
      }
    },
  }
}
</script>