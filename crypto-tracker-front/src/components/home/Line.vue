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
    },
    height: {
      type: Number,
      default: 600
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
  watch: {
    items(newItems) {
      this.chartData.datasets[0].data = []
      this.chartData.labels = []
      newItems.forEach(i => {
        this.chartData.datasets[0].data.push(i.sum.toFixed(2))
        this.chartData.labels.push(i.date)
      })
    }
  },
  data() {
    return {
      chartData: {
        labels: [],
        datasets: [
          {
            lineTension: 0.5,
            label: 'Rewards',
            borderDash: [1, 1],
            backgroundColor: [],
            data: [],
            borderColor: "black",
          }
        ]
      },
      chartOptions: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
      }
    }
  }
}
</script>
