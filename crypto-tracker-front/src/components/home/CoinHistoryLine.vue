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
import chroma from "chroma-js";
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
      this.chartData.datasets = []
      this.chartData.labels = []
      
      this.priceHistory.forEach((h, idx) => {
        this.chartData.labels.push(h.date.slice(2, 10))
        h.coins.forEach(c => {
          const itemId = this.chartData.datasets.findIndex(cd => cd.label === c.coin)
          if(itemId === -1) {
            let arrFill = new Array(idx).fill(undefined)
            arrFill.push(c.value)
            let color = chroma.random()
            this.chartData.datasets.push({ label: c.coin, data: arrFill, datalabels: { display: false }, borderColor: color, pointRadius: 0, backgroundColor: color, borderWidth: 3 })
          } else {
            this.chartData.datasets[itemId].data.push(c.value)
          }
        })
      })
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: []
      },
      chartOptions: {
        animation: false,
        spanGaps: true,
        normalized: true,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            onHover: (evt, item, legend) => {
              legend.chart.data.datasets.map(t => t.borderColor).forEach((color, index, colors) => {
                if(index !== item.datasetIndex) {
                  legend.chart.data.datasets[index].borderColor = legend.chart.data.datasets[index].borderColor + '20'
                }
              })
              legend.chart.data.datasets[item.datasetIndex].borderWidth = 5
              legend.chart.data.datasets[item.datasetIndex].pointRadius = 2
              legend.chart.update()
            },
            onLeave: (evt, item, legend) => {
              legend.chart.data.datasets[item.datasetIndex].borderWidth = 4
              legend.chart.data.datasets[item.datasetIndex].pointRadius = 1
              legend.chart.data.datasets.map(t => t.borderColor).forEach((color, index, colors) => {
                if(legend.chart.data.datasets[index].borderColor.length === 9 ) {
                  legend.chart.data.datasets[index].borderColor = legend.chart.data.datasets[index].borderColor.slice(0, -2)
                }
              })
              legend.chart.update()
            },
            labels: {
              color: 'white',
              boxWidth: 35
            }
          }
        },
        scales: {
          x: { ticks: { color: 'white', maxTicksLimit: 75 } },
          y: { ticks: { color: '#CE93D8' }, beginAtZero: true },
        }
      }
    }
  }
}
</script>
