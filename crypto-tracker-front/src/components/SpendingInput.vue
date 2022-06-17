<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="6">
        <spending-input-comp :items="checkingInItems" type="checkingIn" />
      </v-col>
      <v-col cols="6">
        <spending-input-comp :items="checkingOutItems" type="checkingOut" />
      </v-col>
      <v-col cols="6">
        <spending-input-comp :items="investItems" type="investments" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SpendingInputComp from './SpendingInputComp'
import { getChecking } from '../api/apollo'
  export default {
    props: {
      monthActive: Object,
      checkingInItems: Array,
      checkingOutItems: Array,
      investItems: Array,
    },
    components: {
      SpendingInputComp
    },
    created() {

    },
    methods: {

    }
  }
</script>