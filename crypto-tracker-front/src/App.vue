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
      { title: 'Home', icon: 'mdi-view-dashboard', route: '/' },
      { title: 'Interests', icon: 'mdi-image', route: '/interests' },
      { title: 'Spending', icon: 'mdi-image', route: '/spending' },
      { title: 'Taxes', icon: 'mdi-image', route: '/taxes' },
      { title: 'Rewards', icon: 'mdi-image', route: '/rewards' },
      { title: 'Investments', icon: 'mdi-image', route: '/investments' }
    ]
  }),
  created () {
    this.$store.dispatch('populateInterests')
  }
};
</script>
