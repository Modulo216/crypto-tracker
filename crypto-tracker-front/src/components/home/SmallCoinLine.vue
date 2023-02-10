<template>
  <v-card>
    <v-card-title class="text-h5 lighten-2" style="justify-content: space-between">
      <div>{{ coinName }} <span :style="`color: ${ percDiff > 0 ? 'green' : 'red'}`">{{ (percDiff).toFixed(3) }}%</span></div>
      <span class="tooltip-style">
        <v-btn-toggle v-model="toggle_exclusive" rounded dark>
          <v-btn text @click="populateChart(2)">1D</v-btn>
          <v-btn text @click="populateChart(7)">1W</v-btn>
          <v-btn text @click="populateChart(32)">1M</v-btn>
          <v-btn text @click="populateChart(366)">1Y</v-btn>
          <v-btn text @click="populateChart(3000)">ALL</v-btn>
        </v-btn-toggle>
      </span>
    </v-card-title>
    <v-card-text>
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
    </v-card-text>
  </v-card>
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
        this.toggle_exclusive = 4
        this.populateChart(3000)
      },
      deep: true
    }
  },
  created() {
    this.populateChart(3000)    
  },
  computed: {
    percDiff() {
      let first = this.chartData.datasets[0].data[0]
      let last = this.chartData.datasets[0].data[this.chartData.datasets[0].data.length - 1]
      return Number((first > last ? '-' : '') + (100 * Math.abs( (first - last) / ( (first + last) / 2 ) )))
    }
  },
  methods: {
    populateChart(numOfDays) {
      this.chartData.datasets[0].data = []
      this.chartData.labels = []
      
      this.$store.state.historyChartData.filter(d => d.coins.some(c => c.coin === this.coinName)).slice(-Math.abs(numOfDays)).forEach(h => {
        this.chartData.labels.push(h.date)
        let coin = h.coins.find(c => c.coin === this.coinName)
        this.chartData.datasets[0].data.push(coin.value)
      })
    }
  },
  data() {
    return {
      toggle_exclusive: 4,
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
<style scoped>
.tooltip-style{
  background: rgba(97, 97, 97, 0.9);
  border-radius: 4px;
  padding: 5px 16px;
}
</style>