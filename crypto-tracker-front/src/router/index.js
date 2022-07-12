import Vue from 'vue'
import VueRouter from 'vue-router'
import InterestsView from '../views/InterestsView'
import HomeView from '../views/HomeView'
import SpendingView from '../views/SpendingView.vue'
import TaxesView from '../views/TaxesView.vue'
import RewardsView from '../views/RewardsView'
import InvestmentsView from '../views/InvestmentsView'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/interests',
    name: 'interests',
    component: InterestsView
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
  },
  {
    path: '/investments',
    name: 'investments',
    component: InvestmentsView
  }
]

const router = new VueRouter({
  routes
})

export default router
