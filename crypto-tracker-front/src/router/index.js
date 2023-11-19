import Vue from 'vue'
import VueRouter from 'vue-router'
import InterestsView from '../views/InterestsView'
import HomeView from '../views/HomeView'
import SpendingView from '../views/SpendingView.vue'
import TaxesView from '../views/TaxesView.vue'
import RewardsView from '../views/RewardsView'
import InvestmentsView from '../views/InvestmentsView'
import StockInvestmentsView from '../views/StockInvestmentsView'
import CapitalView from '../views/CapitalView'

Vue.use(VueRouter)

const routes = [
  {
    path: '/capital',
    name: 'capital',
    component: CapitalView
  },
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
    path: '/stock-investments',
    name: 'stockInvestments',
    component: StockInvestmentsView
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
