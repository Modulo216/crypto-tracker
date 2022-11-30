<template>
  <v-container>
    <span>
    <div v-for="(monthYear, index) in monthYears" :key="index" :style="`${active === index ? 'font-size:16px;font-weight:bold' : 'font-size:14px'}`">
      <a @click="active = index;$emit('monthClick', monthYear)">{{ $store.getters.getMonthNames[monthYear.month] }} - {{ monthYear.year.toString().slice(-2) }}</a>
    </div>
    <a :style="`${active === monthYears.length ? 'font-size:16px;font-weight:bold' : 'font-size:14px'}`" @click="active = monthYears.length;$emit('monthClick', 'ALL')">All</a>
    </span>
  </v-container>
</template>

<script>
export default {
  props: {
    trxs: Array
  },
  data: () => ({
    monthYears: [],
    active: 0
  }),
  created() {
    this.populateItems()
    this.active = this.monthYears.length - (this.$route.name === 'investments' ? 0 : 1)
  },
  watch: {
    trxs(newTrxs) {
      this.populateItems()
      this.active = this.monthYears.length - (this.$route.name === 'investments' ? 0 : 1)
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
