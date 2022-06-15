<template>
  <spending-table :trxs="trxs" />
</template>

<script>
  import SpendingTable from '../components/SpendingTable'
  import { getTrxs } from '../api/apollo'
  export default {
    components: {
      SpendingTable
    },
    data: () => ({
      trxs: []
    }),
    created () {
      getTrxs().then(r => this.trxs = [...r])
    },
  }
</script>
