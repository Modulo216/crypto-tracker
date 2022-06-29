<template>
  <v-container>
    <div v-for="month in months" :key="month">
      <a @click="$emit('monthClick', month)">{{ $store.getters.getMonthNames[month] }}</a>
    </div>
  </v-container>
</template>

<script>
export default {
  props: {
    trxs: Array
  },
  data: () => ({
    months: []
  }),
  watch: {
    trxs(newTrxs) {
      newTrxs.forEach(t => {
        const dateMonth = this.$store.getters.getUtcMonth(t.updatedAt)
        if(!this.months.includes(dateMonth)) {
          this.months.push(dateMonth)
        }
      })
    }
  }
}
</script>
