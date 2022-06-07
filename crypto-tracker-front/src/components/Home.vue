<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <h1>This is a home page</h1>
        <v-btn @click="addTag()" depressed color="primary">
          Primary
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getInterests, addInterest } from '../api/apollo'
  export default {
    name: 'Home',
    data: () => ({
      
    }),
    methods: {
      doIt() {
        getInterests().then(r => console.log("Tttt", r))
      },
      addTag() {
        let interest = {}
        interest.nickName = 'Coinbase ETH Wallet'
        interest.name = 'Ethereum'
        interest.currencyPair = 'ETH-USD'
        interest.walletId = '3808ce95-c092-5a04-94f8-349feb47f048'
        addInterest(interest).then(r => console.log("QQQ", r))
      }
    }
  }
</script>
