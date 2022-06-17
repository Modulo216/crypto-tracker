<template>
  <v-container>
    <div v-for="month in months" :key="month.monthPlace">
      <a @click="$emit('monthClick', month)">{{ month.monthName }}</a>
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
      trxs(newTrxs, oldTrxs) {
        newTrxs.forEach(t => {
          const date = new Date(t.updatedAt);
          const monthName = this.$store.getters.getMonthNames[date.getMonth()]
          if(!this.months.some(m => m.monthName === monthName)) {
            this.months.push({ monthPlace: date.getMonth(), monthName })
          }
        })
      }
    }
  }
</script>
