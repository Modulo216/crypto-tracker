<template>
  <span style="position: relative">
    <v-menu absolute offset-y v-model="showTooltip">
      <template v-slot:activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on" style="position:absolute;top:33px;left:80px">
          <div class="text-h4" :style="`color: ${ percDiff > 0 ? 'green' : 'red'}`">{{ (percDiff).toFixed(3) }}%</div>
          <div style="display:flex;justify-content: space-between">
            <v-icon v-if="percDiff > 0" large>mdi-arrow-top-right</v-icon>
            <v-icon v-else large>mdi-arrow-bottom-left</v-icon>
            <div class="text-h5 pt-1" :style="`color: ${ percDiff > 0 ? 'green' : 'red'}`">{{ dollarDiff }}</div>
          </div>
        </div>
      </template>
      <v-btn-toggle v-model="toggle_exclusive" rounded dark>
        <v-btn text @click="populateChart(2)">1D</v-btn>
        <v-btn text @click="populateChart(7)">1W</v-btn>
        <v-btn text @click="populateChart(32)">1M</v-btn>
        <v-btn text @click="populateChart(366)">1Y</v-btn>
        <v-btn text @click="populateChart(3000)">ALL</v-btn>
      </v-btn-toggle>
    </v-menu>
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
  </span>
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
    percDiff() {
      let first = this.chartData.datasets[0].data[0]
      let last = this.chartData.datasets[0].data[this.chartData.datasets[0].data.length - 1]
      return Number((first > last ? '-' : '') + (100 * Math.abs( (first - last) / ( (first + last) / 2 ) )))
    },
    dollarDiff() {
      let first = this.toggle_exclusive === 4 ? 0 : this.chartData.datasets[0].data[0]
      let last = this.chartData.datasets[0].data[this.chartData.datasets[0].data.length - 1]
      return (last - first).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
  },
  created() {
    this.populateChart(366)    
  },
  watch: {
    priceHistory(newVal, oldVal) {
      let val = 3000
      if (this.toggle_exclusive === 0) { val = 2 }
      else if (this.toggle_exclusive === 1) { val = 7 }
      else if (this.toggle_exclusive === 2) { val = 32 }
      else if (this.toggle_exclusive === 3) { val = 366 }
      this.populateChart(val)
    }
  },
  methods: {
    populateChart(numOfDays) {
      this.chartData.datasets[0].data = this.priceHistory.slice(-Math.abs(numOfDays)).map(h => h.coins.map(v => v.value).reduce((prev, next) => prev + next, 0))
      this.chartData.datasets[1].data = []
      this.chartData.datasets[2].data = []
      this.chartData.labels = []
      
      this.priceHistory.slice(-Math.abs(numOfDays)).forEach((h, idx) => {
        this.chartData.labels.push(h.date.slice(2, 10))
        this.chartData.datasets[1].data.push(
          this.investments.filter(t => isBefore(new Date(t.updatedAt), this.getDateAsUtc(h.date)) || isSameDay(new Date(t.updatedAt), this.getDateAsUtc(h.date))).map(t => t.spent).reduce((prev, next) => prev + next, 0)
        )
        if(numOfDays === 3000) {
          this.chartData.datasets[2].data.push(
            this.taxes.filter(t => t.coin === 'USDC' && (isBefore(new Date(t.updatedAt), this.getDateAsUtc(h.date)) || isSameDay(new Date(t.updatedAt), this.getDateAsUtc(h.date)))).map(t => t.value).reduce((prev, next) => prev + next, 0) +
            this.liquidations.filter(t => t.event === 'Sell' && (isBefore(new Date(t.updatedAt), new Date(h.date)) || isSameDay(new Date(t.updatedAt), new Date(h.date)))).map(t => t.usdAmount).reduce((prev, next) => prev + next, 0)
          )
        }
      })
    },
    getDateAsUtc(d) {
      let n = new Date(d)
      return new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())
    }
  },
  data() {
    return {
      toggle_exclusive: 3,
      showTooltip: false,
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
        spanGaps: true,
        normalized: true,
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