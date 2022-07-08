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
  watch: {
    allRewards(newAllRewards) {
      this.chartData.labels = [...this.$store.getters.getMonthNames.slice(0, new Date().getMonth()+1)]

      const monthInterval = eachMonthOfInterval({start: new Date(new Date().getUTCFullYear(), 0, 1), end: new Date(new Date().getUTCFullYear(), 11, 1) })
      monthInterval.forEach(m => {
        if(new Date().getMonth() >= m.getMonth()) {
          this.chartData.datasets[0].data.push(parseInt(newAllRewards.filter(t => new Date(t.updatedAt).getMonth() === m.getMonth()).map(w => parseFloat(w.value)).reduce((prev, next) => prev + next, 0)))
        }
        this.chartData.datasets[0].backgroundColor.push(chroma.random())
      })


      monthInterval.forEach(m => {
        let amount = 0
        if(new Date().getMonth() >= m.getMonth()) {
          newAllRewards.filter(t => new Date(t.updatedAt).getMonth() === m.getMonth()).forEach(r => {
            let coinCookie = $cookies.get(r.coin)
            amount = amount + (coinCookie * r.amount)
          })
        }
        this.chartData.datasets[1].data.push(parseInt(amount))
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
