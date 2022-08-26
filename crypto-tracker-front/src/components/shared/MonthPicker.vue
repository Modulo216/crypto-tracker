<template>
  <v-container>
    <span>
    <div v-for="(monthYear, index) in monthYears" :key="index" style="font-size:14px">
      <a @click="$emit('monthClick', monthYear)">{{ $store.getters.getMonthNames[monthYear.month] }} - {{ monthYear.year.toString().slice(-2) }}</a>
    </div>
    <a @click="$emit('monthClick', 'ALL')">All</a>
    </span>
  </v-container>
</template>

<script>
export default {
  props: {
    trxs: Array
  },
  data: () => ({
    monthYears: []
  }),
  created() {
    this.populateItems()    
  },
  watch: {
    trxs(newTrxs) {
      this.populateItems()
    }
  },
  methods: {
    populateItems() {
      this.trxs.forEach(t => {
        const date = new Date(t.updatedAt)
        let obj = {month: date.getUTCMonth(), year: date.getUTCFullYear()}
        this.monthYears.findIndex(x => x.month === obj.month && x.year === obj.year) === -1 ? this.monthYears.push(obj) : undefined
      })
    }
  }
}
</script>
