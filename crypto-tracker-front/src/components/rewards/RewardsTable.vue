<template>
  <v-container class="pa-1">
    <v-row class="text-center">
      <v-col cols="12">
        <v-data-table v-model="selected" show-select dark dense :loading="loadingRewards" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :headers="headers" :items="rewards" item-key="id" class="elevation-10" hide-default-footer disable-pagination>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>{{ monthNameActive !== 'ALL' ? `${$store.getters.getMonthNames[monthNameActive.month]} - ${monthNameActive.year}` : 'ALL' }} Rewards</v-toolbar-title>
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
              <v-btn color="primary" dark class="ml-2" @click="showLiquidationDialog = true">
                <v-icon dark>
                  mdi-water
                </v-icon>
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:[`header.data-table-select`]></template>
          <template v-slot:[`item.updatedAt`]="{ item }">
            <span>{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template v-slot:[`item.value`]="props">
            <div>{{ getAsCurrency(parseFloat(props.item.value)) }}</div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <liquidation-dialog v-model="showLiquidationDialog" :selected="selected" />
  </v-container>
</template>
<script>
import LiquidationDialog from '../liquidationDialog'
export default {
  props: {
    rewards: Array,
    monthNameActive: {},
  },
  components: {
    LiquidationDialog
  },
  data: () => ({
    selected: [],
    showLiquidationDialog: false,
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
      return ("0" + (theDate.getMonth() + 1)).slice(-2) + '/' + ("0" + theDate.getDate()).slice(-2)
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