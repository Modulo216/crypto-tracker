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
  name: 'small-coin-line',
  components: {
    LineChartGenerator
  },
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
    coinName: String
  },
  watch: {
    coinName: {
      handler(n, o) {
        this.populateChart()
      },
      deep: true
    }
  },
  created() {
    this.populateChart()    
  },
  methods: {
    populateChart() {
      this.chartData.datasets[0].data = []
      this.chartData.labels = []
      
      this.$store.state.historyChartData.filter(d => d.coins.some(c => c.coin === this.coinName)).forEach(h => {
        this.chartData.labels.push(h.date)
        let coin = h.coins.find(c => c.coin === this.coinName)
        this.chartData.datasets[0].data.push(coin.value)
      })
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
            borderColor: "green",
            backgroundColor: 'black',
            pointRadius: 1,
            pointHoverRadius: 10,
            borderWidth: 3
          }
        ]
      },
      chartOptions: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: 'black' } },
          y: { ticks: { color: 'green' } },
        }
      }
    }
  }
}
</script>
