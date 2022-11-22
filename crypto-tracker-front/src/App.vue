<template>
  <v-app style="background-color:#424242">
    <v-app-bar style="background-color: #141E30" app dark clipped-left>
      <h1>Crypto Tracker</h1>
    </v-app-bar>
    <v-navigation-drawer app clipped expand-on-hover :mini-variant.sync="mini" dark>
      <v-list dense nav>
        <v-list-item v-for="item in items" :to="item.route" :key="item.title" link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>
<script>
export default {
  name: 'App',
  data: () => ({
    mini: true,
    items: [
      { title: 'Home', icon: 'mdi-home', route: '/' },
      { title: 'Rewards', icon: 'mdi-gift', route: '/rewards' },
      { title: 'Taxes', icon: 'mdi-currency-usd-off ', route: '/taxes' },
      { title: 'Spending', icon: 'mdi-cart', route: '/spending' },
      { title: 'Investments', icon: 'mdi-treasure-chest', route: '/investments' },
      { title: 'Gains & Losses', icon: 'mdi-water', route: '/capital' },
      { title: 'Interests', icon: 'mdi-thumb-up', route: '/interests' }
    ]
  }),
  created () {
    this.$store.dispatch('populateInterests')
    this.$store.dispatch('populateRewards')
    this.$store.dispatch('populateTaxes')
    this.$store.dispatch('populateInvestments')
    this.$store.dispatch('populateLiquidation')
  }
};
</script>
