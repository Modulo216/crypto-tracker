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
const { isBefore, isSameDay } = require('date-fns')
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
  name: 'history-line',
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
    },
    height: {
      type: Number,
      default: 500
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
    priceHistory: Array
  },
  computed: {
    investments() {
      return this.$store.state.allInvestments
    },
    taxes() {
      return this.$store.state.allTaxes
    },
    liquidations() {
      return this.$store.state.allLiquidation
    },
  },
  created() {
    this.populateChart()    
  },
  watch: {
    priceHistory(newItems) {
      this.populateChart()
    }
  },
  methods: {
    populateChart() {
      this.chartData.datasets[0].data = []
      this.chartData.datasets[1].data = []
      this.chartData.datasets[2].data = []
      this.chartData.labels = []

      this.priceHistory.forEach(h => {
        this.chartData.labels.push(h.date)
        this.chartData.datasets[0].data.push(h.coins.map(i => i.value).reduce((prev, next) => prev + next, 0))
        this.chartData.datasets[1].data.push(
          this.investments.filter(t => isBefore(new Date(t.updatedAt), this.getDateAsUtc(h.date)) || isSameDay(new Date(t.updatedAt), this.getDateAsUtc(h.date))).map(t => parseFloat(t.spent)).reduce((prev, next) => prev + next, 0)
        )
        this.chartData.datasets[2].data.push(
          this.taxes.filter(t => t.coin === 'USDC' && (isBefore(new Date(t.updatedAt), this.getDateAsUtc(h.date)) || isSameDay(new Date(t.updatedAt), this.getDateAsUtc(h.date)))).map(t => parseFloat(t.value)).reduce((prev, next) => prev + next, 0) +
          this.liquidations.filter(t => t.event === 'Sell' && (isBefore(new Date(t.updatedAt), new Date(h.date)) || isSameDay(new Date(t.updatedAt), new Date(h.date)))).map(t => parseFloat(t.usdAmount)).reduce((prev, next) => prev + next, 0)
        )
      })
    },
    getDateAsUtc(d) {
      let n = new Date(d)
      return new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            datalabels: {
              display: false
            },
            data: [],
            borderColor: "gray",
            backgroundColor: 'black',
            pointRadius: 1.5,
            pointHoverRadius: 10
          },
          {
            datalabels: {
              display: false
            },
            data: [],
            borderColor: 'black',
            backgroundColor: 'gray',
            pointRadius: 1.5,
            pointHoverRadius: 10
          },
          {
            datalabels: {
              display: false
            },
            data: [],
            borderColor: 'green',
            backgroundColor: 'green',
            pointRadius: 1,
            pointHoverRadius: 10
          }
        ]
      },
      chartOptions: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: 'white' } },
          y: { ticks: { color: 'green' }, beginAtZero: true },
        }
      }
    }
  }
}
</script>
