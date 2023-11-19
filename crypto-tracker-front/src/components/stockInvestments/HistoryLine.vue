<template>
  <span style="position: relative">
    <v-menu absolute offset-y v-model="showTooltip">
      <template v-slot:activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on" style="position:absolute;top:33px;left:80px">
          <div class="text-h4" :style="`color: ${percDiff > 0 ? 'green' : 'red'}`">{{ (percDiff).toFixed(3) }}%</div>
          <div style="display:flex;justify-content: space-between">
            <v-icon v-if="percDiff > 0" large>mdi-arrow-top-right</v-icon>
            <v-icon v-else large>mdi-arrow-bottom-left</v-icon>
            <div class="text-h5 pt-1" :style="`color: ${percDiff > 0 ? 'green' : 'red'}`">{{ dollarDiff }}</div>
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
    <LineChartGenerator :chart-options="chartOptions" :chart-data="chartData" :chart-id="chartId"
      :dataset-id-key="datasetIdKey" :plugins="plugins" :css-classes="cssClasses" :styles="styles" :width="width"
      :height="height" />
  </span>
</template>

<script>
import { Line as LineChartGenerator } from 'vue-chartjs/legacy'
import dateMixin from '@/mixins/datesMixin'
const { isBefore, isSameDay, endOfYesterday, formatISO } = require('date-fns')
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
      default: () => { }
    },
    plugins: {
      type: Array,
      default: () => []
    },
  },
  computed: {
    stockPriceHistory() {
      return this.$store.state.stockPrices
    },
    stockInvestments() {
      return this.$store.state.allStockInvestments
    },
    percDiff() {
      let first = this.chartData.datasets[0].data[0]
      let last = this.chartData.datasets[0].data[this.chartData.datasets[0].data.length - 1]
      return Number((first > last ? '-' : '') + (100 * Math.abs((first - last) / ((first + last) / 2))))
    },
    dollarDiff() {
      let first = this.toggle_exclusive === 4 ? 0 : this.chartData.datasets[0].data[0]
      let last = this.chartData.datasets[0].data[this.chartData.datasets[0].data.length - 1]
      return (last - first).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
  },
  created() {
    if (this.stockPriceHistory && this.stockInvestments) {
      this.buildChart(366)
    }
  },
  watch: {
    stockPriceHistory(newVal, oldVal) {
      if (this.stockInvestments) {
        this.buildChart()
      }
    },
    stockInvestments(newVal, oldVal) {
      if (this.stockPriceHistory) {
        this.buildChart()
      }
    }
  },
  methods: {
    buildChart() {
      let val = 3000
      if (this.toggle_exclusive === 0) { val = 2 }
      else if (this.toggle_exclusive === 1) { val = 7 }
      else if (this.toggle_exclusive === 2) { val = 32 }
      else if (this.toggle_exclusive === 3) { val = 366 }
      this.populateChart(val)
    },
    populateChart(numOfDays) {
      this.chartData.datasets[0].data = []
      this.chartData.datasets[1].data = []
      this.chartData.labels = []

      this.stockPriceHistory.slice(-Math.abs(numOfDays)).forEach(p => {
        this.chartData.labels.push(p.updatedAt.slice(2, 10))
        let value = 0
        for (const price of p.prices) {
          value += this.stockInvestments.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.stockSymbol === price.symbol).map(i => i.amount).reduce((prev, next) => prev + next, 0) * price.price
        }
        const spent = this.stockInvestments.filter(i => (isBefore(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt)) || isSameDay(new Date(i.updatedAt), this.getDateAsUtc(p.updatedAt))) && i.kind === 'Buy').map(i => i.spent + i.match).reduce((prev, next) => prev + next, 0)
        this.chartData.datasets[0].data.push(value)
        this.chartData.datasets[1].data.push(spent)
      })
    },
    getDateAsUtc(d) {
      let n = new Date(d)
      return new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate())
    },
    externalTooltipHandler(context) {
      const { chart, tooltip } = context
      const tooltipEl = this.getOrCreateTooltip(chart)

      if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0
        return
      }

      if (tooltip.body) {
        const titleLines = tooltip.title || []
        const bodyLines = tooltip.body.map(b => b.lines)

        const tableHead = document.createElement('thead')

        titleLines.forEach(title => {
          const tr = document.createElement('tr')
          const th = document.createElement('th')
          th.appendChild(document.createTextNode(title))
          tr.appendChild(th)
          tableHead.appendChild(tr)
        })

        const tableBody = document.createElement('tbody')
        let values = []
        bodyLines.forEach((body, i) => {
          const colors = tooltip.labelColors[i]

          const span = document.createElement('span')
          span.style.background = colors.backgroundColor
          span.style.borderColor = colors.borderColor
          span.style.borderWidth = '2px'
          span.style.marginRight = '10px'
          span.style.height = '10px'
          span.style.width = '20px'
          span.style.display = 'inline-block'

          const tr = document.createElement('tr')
          const td = document.createElement('td')

          td.appendChild(span)
          td.appendChild(document.createTextNode(`$${body[0]}`))
          tr.appendChild(td)
          tableBody.appendChild(tr)
          values.push(parseFloat(body[0].replace(/\,/g, ''), 10))
        })
        const tr = document.createElement('tr')
        const td = document.createElement('td')
        td.style.color = values[0] >= values[1] ? '#32CD32' : 'red'
        td.appendChild(
          document.createTextNode(`${ (((values[0] - values[1]) / Math.abs(values[1])) * 100).toFixed(3) }% ${this.getAsCurrency(values[0] - values[1])}`)
        )
        tr.appendChild(td)
        tableBody.appendChild(tr)

        const tableRoot = tooltipEl.querySelector('table')

        while (tableRoot.firstChild) {
          tableRoot.firstChild.remove()
        }

        tableRoot.appendChild(tableHead)
        tableRoot.appendChild(tableBody)
      }

      const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas

      tooltipEl.style.opacity = 1
      tooltipEl.style.left = positionX + tooltip.caretX + 'px'
      tooltipEl.style.top = positionY + tooltip.caretY + 'px'
      tooltipEl.style.font = tooltip.options.bodyFont.string
      tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px'
    },
    getOrCreateTooltip(chart) {
      let tooltipEl = chart.canvas.parentNode.querySelector('div')

      if (!tooltipEl) {
        tooltipEl = document.createElement('div')
        tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)'
        tooltipEl.style.borderRadius = '3px'
        tooltipEl.style.color = 'white'
        tooltipEl.style.opacity = 1
        tooltipEl.style.pointerEvents = 'none'
        tooltipEl.style.position = 'absolute'
        tooltipEl.style.transform = 'translate(-50%, 0)'
        tooltipEl.style.transition = 'all .3s ease'

        tooltipEl.appendChild(document.createElement('table'))
        chart.canvas.parentNode.appendChild(tooltipEl)
      }

      return tooltipEl
    },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    }
  },
  data() {
    return {
      toggle_exclusive: 2,
      showTooltip: false,
      chartData: {
        labels: [],
        datasets: [
          {
            datalabels: {
              display: false
            },
            fill: false,
            data: [],
            borderColor: "#1976D2",
            backgroundColor: '#1976D2',
            pointHoverRadius: 10
          },
          {
            datalabels: {
              display: false
            },
            fill: false,
            data: [],
            borderColor: 'gray',
            backgroundColor: 'gray',
            pointHoverRadius: 10
          },
        ]
      },
      chartOptions: {
        spanGaps: true,
        normalized: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            position: 'nearest',
            external: this.externalTooltipHandler
          }
        },
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