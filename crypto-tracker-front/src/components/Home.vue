<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <h1>This is a home page</h1>
        <v-btn @click="doIt()" depressed color="primary">
          Primary
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'Home',
    data: () => ({

    }),
    methods: {
      doIt() {
        console.log("GO")
      }
    }
  }
</script>
