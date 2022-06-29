<template>
  <interests-table />
</template>

<script>
  import Home from '../components/Home'
  import InterestsTable from '../components/interests/InterestsTable'

  export default {
    name: 'HomeView',

    components: {
      Home,
      InterestsTable
    },
  }
</script>
