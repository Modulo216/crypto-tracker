<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
    <h1>This is an about page</h1>
    </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'About',
  data () {
    return {
      items: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard' },
        { title: 'Photos', icon: 'mdi-image' },
        { title: 'About', icon: 'mdi-help-box' },
      ],
    }
  }
}
</script>