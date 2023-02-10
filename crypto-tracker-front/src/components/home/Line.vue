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
    items: Array
  },
  created() {
    this.populateChart()    
  },
  watch: {
    items(newItems) {
      this.populateChart()
    }
  },
  methods: {
    populateChart() {
      this.chartData.datasets[0].data = this.items.map(i => Math.round(i.sum))
      this.chartData.labels = this.items.map(i => i.date)
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            data: [],
            borderColor: "#1976D2",
            backgroundColor: 'black',
            pointRadius: 2,
            pointHoverRadius: 10,
            borderWidth: 5
          }
        ]
      },
      chartOptions: {
        normalized: true,
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: 'white', maxTicksLimit: 17, maxRotation: 15  } },
          y: { ticks: { color: '#CE93D8' } },
        }
      }
    }
  }
}
</script>
