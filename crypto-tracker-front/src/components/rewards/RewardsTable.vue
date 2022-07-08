<template>
  <v-container class="pa-1">
    <v-row class="text-center">
      <v-col cols="12">
        <v-data-table
          dark
          dense
          :loading="loadingRewards"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :headers="headers"
          :items="rewards"
          item-key="id"
          class="elevation-10"
          hide-default-footer
          disable-pagination
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>{{ monthNameActive }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <span>{{ `${rewards.length} transactions` }}</span>
              <v-btn color="primary" dark class="ml-2" @click="emitRefresh()" :loading="loadingRewards" :disabled="loadingRewards">
                <v-icon dark>
                  mdi-refresh
                </v-icon>
              </v-btn>
              <download-excel :data="rewards">
                <v-btn color="primary" dark class="ml-2">
                  <v-icon dark>
                    mdi-download
                  </v-icon>
                </v-btn>
              </download-excel>
            </v-toolbar>
          </template>
          <template v-slot:[`item.updatedAt`]="{ item }">
            <span>{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template v-slot:[`item.value`]="props">
            <div>{{ getAsCurrency(parseFloat(props.item.value)) }}</div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  props: {
    rewards: Array,
    monthNameActive: String,
  },
  data: () => ({
    loadingRewards: false,
    sortBy: 'updatedAt',
    sortDesc: true,
    headers: [
      { text: 'Updated At', sortable: true, value: 'updatedAt' },
      { text: 'Coin', sortable: true, value: 'coin' },
      { text: 'Amount', sortable: false, value: 'amount' },
      { text: 'Value', sortable: true, value: 'value' }
    ],
  }),
  methods: {
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    formatDate(d) {
      let theDate = new Date(d)
      return ("0" + (theDate.getUTCMonth() + 1)).slice(-2) + '/' + ("0" + theDate.getUTCDate()).slice(-2)
    },
    async emitRefresh() {
      this.loadingRewards = true
      await this.$emit('refreshRewards', callbackVal => {
        if(callbackVal === "done") {
          this.loadingRewards = false
        }
      })
    }
  }
}
</script>