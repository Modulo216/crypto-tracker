<template>
  <LineChartGenerator
    :chart-options="chartOptions"
    :chart-data="chartData"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :plugins="plugins"
    :css-classes="cssClasses"
    :styles="styles"
    :width="width"
    :height="height"
  />
</template>

<script>
import { Line as LineChartGenerator } from 'vue-chartjs/legacy'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
} from 'chart.js'
import dateMixin from '@/mixins/datesMixin'
const { isAfter } = require('date-fns')
import endOfMonth from 'date-fns/endOfMonth'
import isWithinInterval from 'date-fns/isWithinInterval'
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
)

export default {
  name: 'LineChart',
  components: {
    LineChartGenerator
  },
  mixins: [dateMixin],
  props: {
    chartId: {
      type: String,
      default: 'line-chart'
    },
    datasetIdKey: {
      type: String,
      default: 'label'
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 400
    },
    cssClasses: {
      default: '',
      type: String
    },
    styles: {
      type: Object,
      default: () => {}
    },
    plugins: {
      type: Array,
      default: () => []
    },
    selectedYear: String
  },
  created() {
    if(this.allTrxs.length > 0 && this.allChecking.length > 0) {
      this.populateChart()
    }
  },
  computed: {
    allTrxs() {
      return this.$store.state.spendingTrxs.filter(s => s.updatedAt.substring(0,4) === this.selectedYear)
    },
    allChecking() {
      return this.$store.state.spendingChecking
    },
    allTaxes() {
      return this.$store.state.allTaxes
    },
    allLiquidations() {
      return this.$store.state.allLiquidation
    },
    allItems() {
      return this.$store.state.spendingChecking + this.$store.state.spendingTrxs + this.$store.state.allTaxes + this.$store.state.allLiquidation
    }
  },
  watch: {
    allItems() {
      this.populateChart()
    },
    selectedYear() {
      this.populateChart()
    }
  },
  methods: {
    populateChart() {
      this.chartData.datasets[0].data = []
      this.chartData.datasets[1].data = []
      this.chartData.labels = []
      let monthYears = []

      this.allTrxs.forEach(t => {
        const date = new Date(t.updatedAt)
        let obj = {month: date.getUTCMonth(), year: date.getUTCFullYear()}
        monthYears.findIndex(x => x.month === obj.month && x.year === obj.year) === -1 ? monthYears.push(obj) : undefined
      })
      let savedArr = []
      monthYears.forEach(m => {
        let startDate = new Date(m.year, m.month, 1)
        let totalSaved = (this.allLiquidations.filter(t => t.event === 'Sell' && isWithinInterval(new Date(t.updatedAt), { start: startDate, end: endOfMonth(startDate) })).map(item => item.usdAmount).reduce((prev, next) => prev + next, 0) +
          this.allTrxs.filter(i => i.hasOwnProperty('cashRewardRate') && i.cashRewardRate !== 0 && isWithinInterval(new Date(i.updatedAt), { start: startDate, end: endOfMonth(startDate) })).map(item => item.amount * (item.cashRewardRate * .01)).reduce((prev, next) => prev + next, 0) + 
          this.allTaxes.filter(t => t.coin === 'USDC' && isWithinInterval(new Date(t.updatedAt), { start: startDate, end: endOfMonth(startDate) })).map(item => item.amount).reduce((prev, next) => prev + next, 0) +
          this.allChecking.filter(i => i.type === 'checkingIn' && isWithinInterval(new Date(i.date), { start: startDate, end: endOfMonth(startDate) })).map(item => item.amount).reduce((prev, next) => prev + next, 0)) -
          (this.allTrxs.filter(t => isWithinInterval(new Date(t.updatedAt), { start: startDate, end: endOfMonth(startDate) })).map(item => item.amount).reduce((prev, next) => prev + next, 0) +
          this.allChecking.filter(i => (i.type === 'checkingOut' || i.type === 'investments') && isWithinInterval(new Date(i.date), { start: startDate, end: endOfMonth(startDate) })).map(item => item.amount).reduce((prev, next) => prev + next, 0))  
        savedArr.push(totalSaved)
        let totalIn = this.allChecking.filter(i => i.type === 'checkingIn' && isWithinInterval(new Date(i.date), { start: new Date(m.year,0,1), end: endOfMonth(startDate) })).map(item => item.amount).reduce((prev, next) => prev + next, 0)

        this.chartData.datasets[0].data.push(savedArr.reduce((prev, next) => prev + next, 0).toFixed(2))
        this.chartData.datasets[1].data.push(totalSaved.toFixed(2))
        this.chartData.datasets[2].data.push(totalIn.toFixed(2))
        this.chartData.labels.push(this.$store.getters.getMonthNames[m.month])
      })
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Total saved',
            data: [],
            borderColor: "black",
            backgroundColor: 'black',
            pointRadius: 2,
          },
          {
            label: 'Monthly saved',
            data: [],
            borderColor: "blue",
            backgroundColor: 'blue',
            pointRadius: 2,
          },
          {
            label: 'Total in',
            data: [],
            borderColor: "red",
            backgroundColor: 'red',
            pointRadius: 2,
          }
        ]
      },
      chartOptions: {
        spanGaps: true,
        normalized: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: 'white', autoSkip: true, maxTicksLimit: 50, maxRotation: 35 } },
          y: { type: 'linear', ticks: { color: '#CE93D8' } },
        }
      }
    }
  }
}
</script>
