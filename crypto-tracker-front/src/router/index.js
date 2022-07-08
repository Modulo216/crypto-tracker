import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import SpendingView from '../views/SpendingView.vue'
import TaxesView from '../views/TaxesView.vue'
import RewardsView from '../views/RewardsView'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/spending',
    name: 'spending',
    component: SpendingView
  },
  {
    path: '/taxes',
    name: 'taxes',
    component: TaxesView
  },
  {
    path: '/rewards',
    name: 'rewards',
    component: RewardsView
  }
]

const router = new VueRouter({
  routes
})

export default router
