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
    investments: Array
  },
  created() {
    this.populateChart()    
  },
  watch: {
    investments() {
      this.populateChart()
    }
  },
  methods: {
    populateChart() {
      this.chartData.datasets[0].data = []
      this.chartData.datasets[1].data = []
      this.chartData.labels = []
      let monthYears = []

      this.investments.forEach(t => {
        const date = new Date(t.updatedAt)
        let obj = {month: date.getUTCMonth(), year: date.getUTCFullYear()}
        monthYears.findIndex(x => x.month === obj.month && x.year === obj.year) === -1 ? monthYears.push(obj) : undefined
      })
      monthYears.forEach((m, idx) => {
        this.chartData.labels.push(`${this.$store.getters.getMonthNames[m.month]} ${m.year.toString().slice(-2)}`)
        this.chartData.datasets[0].data.push(
          this.investments.filter(t => isAfter(new Date(m.year, m.month, 30), new Date(t.updatedAt))).map(t => parseFloat(t.spent)).reduce((prev, next) => prev + next, 0).toFixed(2)
        )
        
        this.chartData.datasets[1].data.push(
          (this.investments.filter(t => isAfter(new Date(m.year, m.month, 30), new Date(t.updatedAt))).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0) *
            ((idx + 1 === monthYears.length) ? this.$store.getters.getCoinPrice(this.investments[0].coin).price || 0 : 
            this.investments.filter(t => new Date(t.updatedAt).getUTCMonth() === m.month && new Date(t.updatedAt).getUTCFullYear() === m.year).map(t => parseFloat(t.fillPrice)).reduce((avg, value, _, { length }) => avg + value / length, 0))
          ).toFixed(2)
        )
      })
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'spent',
            borderDash: [1, 1],
            backgroundColor: 'red',
            data: [],
            borderColor: "black",
            pointRadius: 0,
          },
          {
            label: 'value',
            borderDash: [1, 1],
            backgroundColor: 'blue',
            data: [],
            borderColor: "gray",
            pointRadius: 0
          }
        ]
      },
      chartOptions: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false
      }
    }
  }
}
</script>
