<template>
  <v-app>
    <v-app-bar color="green" class="flex-grow-0" app dark>
      <h1>Crypto Tracker</h1>
    </v-app-bar>
    <v-navigation-drawer app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            Navigation..
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
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
    <v-container>
      <v-main>
        <router-view/>
      </v-main>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    items: [
      { title: 'Home', icon: 'mdi-view-dashboard', route: '/' },
      { title: 'Interests', icon: 'mdi-image', route: '/about' }
    ]
  })
};
</script>
