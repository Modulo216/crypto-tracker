<template>
  <Pie
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
import { Pie } from 'vue-chartjs/legacy'
import chroma from "chroma-js";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ChartDataLabels)

export default {
  name: 'PieChart',
  components: {
    Pie
  },
  props: {
    chartId: {
      type: String,
      default: 'pie-chart'
    },
    datasetIdKey: {
      type: String,
      default: 'label'
    },
    width: {
      type: Number,
      default: 550
    },
    height: {
      type: Number,
      default: 550
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
    trxs: Array
  },
  data() {
    return {
      chartData: {
        labels: [ ...this.$store.getters.getCategories ],
        datasets: [
          {
            backgroundColor: [...this.getColors()],
            data: []
          }
        ]
      },
      chartOptions: {
        plugins: { legend: { display: false } },
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  watch: {
    trxs(newTrxs) {
      let valArr = [...this.$store.getters.getCategories.map(c => 
        newTrxs.filter(t => t.category === c).map(({amount}) => parseInt(amount)).reduce((prev, next) => prev + next, 0)
      )]      

      this.chartData.datasets[0].data = [...valArr.map(v => v === 0 ? undefined : v)]
    }
  },
  methods: {
    getColors() {
      var stringToColor = function(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
          var value = (hash >> (i * 8)) & 0xFF;
          colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
      }
      let colors = []
      this.$store.getters.getCategories.forEach(c => {
        colors.push(stringToColor(c))
      })

      return colors
    }
  }
}
</script>