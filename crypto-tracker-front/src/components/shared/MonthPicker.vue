<template>
  <v-container>
    <span>
    <!-- <div v-for="month in months" :key="month">
      <a @click="$emit('monthClick', month)">{{ $store.getters.getMonthNames[month] }}</a>
    </div> -->
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
    months: [],
    monthYears: []
  }),
  watch: {
    trxs(newTrxs) {
      newTrxs.forEach(t => {
        const dateMonth = this.$store.getters.getUtcMonth(t.updatedAt)
        if(!this.months.includes(dateMonth)) {
          this.months.push(dateMonth)
        }

        const date = new Date(t.updatedAt)
        let obj = {month: date.getUTCMonth(), year: date.getUTCFullYear()}
        this.monthYears.findIndex(x => x.month === obj.month && x.year === obj.year) === -1 ? this.monthYears.push(obj) : undefined
      })
      console.log("T", this.monthYears)
    }
  }
}
</script>
