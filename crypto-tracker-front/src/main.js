import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VueCookies from 'vue-cookies'
import JsonExcel from "vue-json-excel";
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.config.productionTip = false
Vue.use(VueCookies, { expire: '7d'})
Vue.component("downloadExcel", JsonExcel);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
