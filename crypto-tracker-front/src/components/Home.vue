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
import { getInt, addInterest } from '../api/apollo'
  export default {
    name: 'Home',
    data: () => ({
      
    }),
    methods: {
      doIt() {
        getInt().then(r => console.log("Tttt", r))
      },
      addTag() {
        addInterest('testtesttest').then(r => console.log("QQQ", r))
      }
    }
  }
</script>
