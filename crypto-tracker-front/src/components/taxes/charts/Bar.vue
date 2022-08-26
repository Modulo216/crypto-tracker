<template>
  <Bar
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
import { Bar } from 'vue-chartjs/legacy'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import chroma from "chroma-js";
import dateMixin from '@/mixins/datesMixin'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'BarChart',
  components: {
    Bar
  },
  mixins: [dateMixin],
  props: {
    chartId: {
      type: String,
      default: 'bar-chart'
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
    allTaxes: Array
  },
  created() {
    this.populateChart()    
  },
  watch: {
    allTaxes(newAllTaxes) {
      this.populateChart()
    }
  },
  methods: {
    populateChart() {
      this.chartData.datasets[0].data = []
      this.chartData.labels = []
      let monthYears = []

      this.allTaxes.forEach(t => {
        const date = new Date(t.updatedAt)
        let obj = {month: date.getUTCMonth(), year: date.getUTCFullYear()}
        monthYears.findIndex(x => x.month === obj.month && x.year === obj.year) === -1 ? monthYears.push(obj) : undefined
      })

      monthYears.forEach(m => {
        this.chartData.labels.push(`${this.$store.getters.getMonthNames[m.month]} ${m.year.toString().slice(-2)}`)
        this.chartData.datasets[0].data.push(parseInt(this.allTaxes.filter(t => this.dateIsInRange(t.updatedAt, m)).map(w => parseFloat(w.value)).reduce((prev, next) => prev + next, 0)))
        this.chartData.datasets[0].backgroundColor.push(chroma.random())
      })
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Data One',
            backgroundColor: [],
            data: []
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