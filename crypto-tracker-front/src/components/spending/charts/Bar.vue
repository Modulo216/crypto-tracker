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
import lastDayOfMonth from 'date-fns/lastDayOfMonth'
import startOfYear from 'date-fns/startOfYear'
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
  },
  computed: {
    allTrxs() {
      return this.$store.state.spendingTrxs
    }
  },
  created() {
    if(this.$store.state.spendingTrxs.length > 0) {
      this.buildTable(this.$store.state.spendingTrxs)
    }
  },
  watch: {
    allTrxs(newAllTrxs) {
      this.buildTable(newAllTrxs)
    }
  },
  methods: {
    buildTable(newAllTrxs) {
      for(let i = 0;i <= 4;i++) {
        this.chartData.datasets[i].data = []
      }
      this.chartData.labels = [...this.$store.getters.getMonthNames.slice(0, new Date().getMonth()+1)]

      eachMonthOfInterval({ start: startOfYear(new Date()), end: lastDayOfMonth(new Date()) }).forEach(m => {
        let trxDate = (t) => new Date(t.updatedAt)
        this.chartData.datasets[0].data.push(parseInt(newAllTrxs.filter(t => trxDate(t).getMonth() === m.getMonth() && trxDate(t).getDate() <= 7).map(w => parseFloat(w.amount)).reduce((prev, next) => prev + next, 0)))
        this.chartData.datasets[1].data.push(parseInt(newAllTrxs.filter(t => trxDate(t).getMonth() === m.getMonth() && trxDate(t).getDate() >= 8 && trxDate(t).getDate() <= 14).map(w => parseFloat(w.amount)).reduce((prev, next) => prev + next, 0)))
        this.chartData.datasets[2].data.push(parseInt(newAllTrxs.filter(t => trxDate(t).getMonth() === m.getMonth() && trxDate(t).getDate() >= 15 && trxDate(t).getDate() <= 21).map(w => parseFloat(w.amount)).reduce((prev, next) => prev + next, 0)))
        this.chartData.datasets[3].data.push(parseInt(newAllTrxs.filter(t => trxDate(t).getMonth() === m.getMonth() && trxDate(t).getDate() >= 22 && trxDate(t).getDate() <= 28).map(w => parseFloat(w.amount)).reduce((prev, next) => prev + next, 0)))
        this.chartData.datasets[4].data.push(parseInt(newAllTrxs.filter(t => trxDate(t).getMonth() === m.getMonth() && trxDate(t).getDate() >= 29).map(w => parseFloat(w.amount)).reduce((prev, next) => prev + next, 0)))
      })
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