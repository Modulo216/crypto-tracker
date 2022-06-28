<template>
  <Bar
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
import { Bar } from 'vue-chartjs/legacy'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'BarChart',
  components: {
    Bar
  },
  props: {
    chartId: {
      type: String,
      default: 'bar-chart'
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
    allTrxs: Array
  },
  watch: {
    allTrxs(newAllTrxs) {
      this.chartData.labels = [...this.$store.getters.getMonthNames.slice(0, new Date().getMonth()+1)]

      const monthInterval = eachMonthOfInterval({start: new Date(new Date().getUTCFullYear(), 0, 1), end: new Date(new Date().getUTCFullYear(), 11, 1) })
      let week1 = [], week2 = [], week3 = [], week4 = [], week5 = []
      monthInterval.forEach(m => {
        if(new Date().getMonth() >= m.getMonth()) {
          week1.push(newAllTrxs.filter(t => new Date(t.updatedAt).getMonth() === m.getMonth() && new Date(t.updatedAt).getDate() <= 7).map(w => parseFloat(w.amount)).reduce((prev, next) => prev + next, 0))
          week2.push(newAllTrxs.filter(t => new Date(t.updatedAt).getMonth() === m.getMonth() && new Date(t.updatedAt).getDate() >= 8 && new Date(t.updatedAt).getDate() <= 14).map(w => parseFloat(w.amount)).reduce((prev, next) => prev + next, 0))
          week3.push(newAllTrxs.filter(t => new Date(t.updatedAt).getMonth() === m.getMonth() && new Date(t.updatedAt).getDate() >= 15 && new Date(t.updatedAt).getDate() <= 21).map(w => parseFloat(w.amount)).reduce((prev, next) => prev + next, 0))
          week4.push(newAllTrxs.filter(t => new Date(t.updatedAt).getMonth() === m.getMonth() && new Date(t.updatedAt).getDate() >= 22 && new Date(t.updatedAt).getDate() <= 28).map(w => parseFloat(w.amount)).reduce((prev, next) => prev + next, 0))
          week5.push(newAllTrxs.filter(t => new Date(t.updatedAt).getMonth() === m.getMonth() && new Date(t.updatedAt).getDate() >= 29 && new Date(t.updatedAt).getDate() <= 31).map(w => parseFloat(w.amount)).reduce((prev, next) => prev + next, 0))
        }
      })

      this.chartData.datasets[0].data = [...week1.map(w => parseInt(w))]
      this.chartData.datasets[1].data = [...week2.map(w => parseInt(w))]
      this.chartData.datasets[2].data = [...week3.map(w => parseInt(w))]
      this.chartData.datasets[3].data = [...week4.map(w => parseInt(w))]
      this.chartData.datasets[4].data = [...week5.map(w => parseInt(w))]
    }
  },
  data() {
    return {
      chartData: {
        labels: [ ],
        datasets: [
          {
            label: 'Week 1',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: '#FF',
            borderWidth: 1
          },
          {
            label: 'Week 2',
            data: [],
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            borderColor: '#FF',
            borderWidth: 1
          },
          {
            label: 'Week 3',
            data: [],
            backgroundColor: 'rgba(52, 47, 191, 0.5)',
            borderColor: '#FF',
            borderWidth: 1
          },
          {
            label: 'Week 4',
            data: [],
            backgroundColor: 'rgba(216, 105, 41, 0.5)',
            borderColor: '#FF',
            borderWidth: 1
          },
          {
            label: 'Week 5',
            data: [],
            backgroundColor: '#FFA500',
            borderColor: '#FF',
            borderWidth: 1
          }
          
        ]
      },
      chartOptions: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { stacked: true }, y: { stacked: true } }
      }
    }
  }
}
</script>