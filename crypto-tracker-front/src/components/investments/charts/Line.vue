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
import chroma from "chroma-js"
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
  watch: {
    investments(newInvestments) {
      this.chartData.datasets[0].data = []
      this.chartData.datasets[1].data = []
      this.chartData.labels = []
      let monthYears = []

      newInvestments.forEach(t => {
        const date = new Date(t.updatedAt)
        let obj = {month: date.getUTCMonth(), year: date.getUTCFullYear()}
        monthYears.findIndex(x => x.month === obj.month && x.year === obj.year) === -1 ? monthYears.push(obj) : undefined
      })
      monthYears.forEach((m, idx) => {
        this.chartData.labels.push(`${this.$store.getters.getMonthNames[m.month]} ${m.year.toString().slice(-2)}`)
        this.chartData.datasets[0].data.push(
          newInvestments.filter(t => isAfter(new Date(m.year, m.month, 30), new Date(t.updatedAt))).map(t => parseFloat(t.spent)).reduce((prev, next) => prev + next, 0).toFixed(2)
        )
        
        this.chartData.datasets[1].data.push(
          (newInvestments.filter(t => isAfter(new Date(m.year, m.month, 30), new Date(t.updatedAt))).map(t => parseFloat(t.amount)).reduce((prev, next) => prev + next, 0) *
            ((idx + 1 === monthYears.length) ? $cookies.get(newInvestments[0].coin) || 0 : 
            newInvestments.filter(t => new Date(t.updatedAt).getUTCMonth() === m.month && new Date(t.updatedAt).getUTCFullYear() === m.year && t.fillPrice).map(t => parseFloat(t.fillPrice)).reduce((avg, value, _, { length }) => avg + value / length, 0))
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
          },
          {
            label: 'value',
            borderDash: [1, 1],
            backgroundColor: 'blue',
            data: [],
            borderColor: "gray",
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
