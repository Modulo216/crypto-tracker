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
    selectedYear: String
  },
  computed: {
    allTrxs() {
      return this.$store.state.spendingTrxs.filter(s => s.updatedAt.substring(0,4) === this.selectedYear)
    }
  },
  created() {
    if(this.$store.state.spendingTrxs.length > 0) {
      this.buildTable(this.$store.state.spendingTrxs.filter(s => s.updatedAt.substring(0,4) === this.selectedYear))
    }
  },
  watch: {
    allTrxs(newAllTrxs) {
      this.buildTable(newAllTrxs)
    }
  },
  methods: {
    buildTable(newAllTrxs) {
      this.chartData.labels = []
      for(let i = 0;i <= 4;i++) {
        this.chartData.datasets[i].data = []
      }

      eachMonthOfInterval({ start: startOfYear(new Date(parseInt(this.selectedYear), 0, 1)), end: lastDayOfMonth(new Date()) }).forEach(m => {
        let trxDate = (t) => new Date(t.updatedAt)
        this.chartData.datasets[0].data.push(parseInt(newAllTrxs.filter(t => trxDate(t).getMonth() === m.getMonth() && trxDate(t).getDate() <= 7).map(w => w.amount).reduce((prev, next) => prev + next, 0)))
        this.chartData.datasets[1].data.push(parseInt(newAllTrxs.filter(t => trxDate(t).getMonth() === m.getMonth() && trxDate(t).getDate() >= 8 && trxDate(t).getDate() <= 14).map(w => w.amount).reduce((prev, next) => prev + next, 0)))
        this.chartData.datasets[2].data.push(parseInt(newAllTrxs.filter(t => trxDate(t).getMonth() === m.getMonth() && trxDate(t).getDate() >= 15 && trxDate(t).getDate() <= 21).map(w => w.amount).reduce((prev, next) => prev + next, 0)))
        this.chartData.datasets[3].data.push(parseInt(newAllTrxs.filter(t => trxDate(t).getMonth() === m.getMonth() && trxDate(t).getDate() >= 22 && trxDate(t).getDate() <= 28).map(w => w.amount).reduce((prev, next) => prev + next, 0)))
        this.chartData.datasets[4].data.push(parseInt(newAllTrxs.filter(t => trxDate(t).getMonth() === m.getMonth() && trxDate(t).getDate() >= 29).map(w => w.amount).reduce((prev, next) => prev + next, 0)))
        
        if(!this.chartData.labels.includes(this.$store.getters.getMonthNames[m.getMonth()])) {
          this.chartData.labels.push(this.$store.getters.getMonthNames[m.getMonth()])
        }
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
            backgroundColor: '#051923BB',
          },
          {
            label: 'Week 2',
            data: [],
            backgroundColor: '#003554BB',
          },
          {
            label: 'Week 3',
            data: [],
            backgroundColor: '#006494BB',
          },
          {
            label: 'Week 4',
            data: [],
            backgroundColor: '#0582caBB',
          },
          {
            label: 'Week 5',
            data: [],
            backgroundColor: '#00a6fbBB',
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