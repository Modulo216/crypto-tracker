<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <h1>This is a home page</h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getInvestments, getRewards, getTaxes } from '../api/apollo'
import { getCoinPrice } from '../api/endpoints/coinbase'
export default {
  name: 'home-view',
  data () {
    return {
      rewards: [],
      investments: [],
      taxes: [],
    }
  }
}
</script>