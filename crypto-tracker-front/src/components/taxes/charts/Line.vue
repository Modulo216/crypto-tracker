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
import dateMixin from '@/mixins/datesMixin'
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
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import chroma from "chroma-js";
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
    allRewards: Array
  },
  created() {
    this.populateChart()    
  },
  watch: {
    allRewards(newAllRewards) {
      this.populateChart()
    }
  },
  methods: {
    populateChart() {
      this.chartData.datasets[0].data = []
      this.chartData.datasets[1].data = []
      this.chartData.labels = []
      let monthYears = []

      this.allRewards.forEach(t => {
        const date = new Date(t.updatedAt)
        let obj = {month: date.getUTCMonth(), year: date.getUTCFullYear()}
        monthYears.findIndex(x => x.month === obj.month && x.year === obj.year) === -1 ? monthYears.push(obj) : undefined
      })

      monthYears.forEach(m => {
        this.chartData.datasets[0].data.push(parseInt(this.allRewards.filter(t => this.dateIsInRange(t.updatedAt, m)).map(w => parseFloat(w.value)).reduce((prev, next) => prev + next, 0)))
        
        let amount = 0
        this.allRewards.filter(t => this.dateIsInRange(t.updatedAt, m) && t.liquidation === null).forEach(r => {
          let coinCookie = $cookies.get(r.coin)
          amount = amount + (coinCookie * r.amount)
        })
        this.chartData.datasets[1].data.push(parseInt(amount))

        this.chartData.labels.push(`${this.$store.getters.getMonthNames[m.month]} ${m.year.toString().slice(-2)}`)
        this.chartData.datasets[0].backgroundColor.push(chroma.random())
        this.chartData.datasets[1].backgroundColor.push(chroma.random())
      })
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            label: 'Rewards',
            borderDash: [3, 7],
            backgroundColor: [],
            data: [],
            borderColor: "red",
          },
          {
            label: 'Value',
            borderDash: [5, 5],
            backgroundColor: [],
            data: [],
            borderColor: "#bae755",
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
