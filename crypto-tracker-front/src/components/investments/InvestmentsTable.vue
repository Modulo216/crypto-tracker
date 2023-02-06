<template>
  <v-container class="pa-1">
    <v-row class="text-center">
      <v-col cols="12">
        <v-data-table v-model="selected" show-select dark dense :loading="loadingInvestments" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :headers="headers" :items="investments" item-key="id" class="elevation-10" hide-default-footer disable-pagination>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>{{ monthNameActive !== 'ALL' ? `${$store.getters.getMonthNames[monthNameActive.month]} - ${monthNameActive.year}` : 'ALL' }} Investments</v-toolbar-title>
              <v-spacer></v-spacer>
              <span>{{ `${investments.length} transactions` }}</span>
              <v-btn color="primary" dark class="ml-2" @click="emitRefresh()" :loading="loadingInvestments" :disabled="loadingInvestments">
                <v-icon dark>
                  mdi-refresh
                </v-icon>
              </v-btn>
              <v-btn color="primary" dark class="ml-2" @click="dialog = true" :disabled="loadingInvestments">
                <v-icon dark>
                  mdi-plus-thick
                </v-icon>
              </v-btn>
              <download-excel :data="investments">
                <v-btn color="primary" dark class="ml-2">
                  <v-icon dark>
                    mdi-download
                  </v-icon>
                </v-btn>
              </download-excel>
              <v-btn color="primary" :disabled="selected.length === 0 || !selected.map(i => i.coin).every((val, i, arr) => val === arr[0])" dark class="ml-2" @click="showLiquidationDialog = true">
                <v-icon dark>
                  mdi-water
                </v-icon>
                <span v-if="selected.length > 0">{{ selected.map(item => item.amount).reduce((prev, next) => prev + next, 0).toFixed(8)}}</span>
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:[`header.data-table-select`]></template>
          <template v-slot:[`item.data-table-select`]="{ item, isSelected, select }">
            <v-simple-checkbox :value="isSelected" :readonly="item.liquidation !== null" :disabled="item.liquidation !== null" @input="select($event)" />
          </template>
          <template v-slot:[`item.amount`]="{ item }">
            <span>{{ Number(item.amount).toFixed(8) }}</span>
          </template>
          <template v-slot:[`item.updatedAt`]="{ item }">
            <span>{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template v-slot:[`item.spent`]="{ item }">
            <div>{{ getAsCurrency(item.spent) }}</div>
          </template>
          <template v-slot:[`item.fillPrice`]="{ item }">
            <div>{{ item.fillPrice ? getAsCurrency(item.fillPrice) : '...' }}</div>
          </template>
          <template v-slot:[`item.value`]="{ item }">
            <div>{{ getAsCurrency(item.value) }}</div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" max-width="800px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">New Investment</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="4">
                <v-text-field v-model="editItem.updatedAt" label="Created Date" />
              </v-col>
              <v-col cols="4">
                <v-combobox v-model="editItem.coin" :items="['BTC','ETH']" label="Coin" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model="editItem.amount" label="Amount" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="editItem.fillPrice" label="Fill Price" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="editItem.spent" label="Spent" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false;editItem = Object.assign({}, defaultItem)">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <liquidation-dialog v-model="showLiquidationDialog" :selected="selected" modelType="investments" @savedLiquidation="selected = []" />
  </v-container>
</template>
<script>
import { addInvestment } from '../../api/apollo'
import LiquidationDialog from '../liquidationDialog'
export default {
  props: {
    investments: Array,
    monthNameActive: {},
  },
  components: {
    LiquidationDialog
  },
  data: () => ({
    showLiquidationDialog: false,
    selected: [],
    loadingInvestments: false,
    sortBy: 'updatedAt',
    sortDesc: true,
    headers: [
      { text: 'Updated At', sortable: true, value: 'updatedAt' },
      { text: 'Coin', sortable: true, value: 'coin' },
      { text: 'Fill Price', sortable: true, value: 'fillPrice' },
      { text: 'Amount', sortable: true, value: 'amount' },
      { text: 'Spent', sortable: true, value: 'spent' },
      { text: 'Value', sortable: true, value: 'value' }
    ],
    dialog: false,
    defaultItem: {
      updatedAt: '',
      coin: '',
      amount: '',
      fillPrice: 0.01,
      spent: 0,
      investType: 'buy'
    },
    editItem: {
      updatedAt: '',
      coin: '',
      amount: '',
      fillPrice: 0.01,
      spent: 0,
      investType: 'buy'
    },
  }),
  methods: {
    save(e) {
      addInvestment(this.editItem)
      this.$emit('investmentAdded', this.editItem)
      this.editItem = Object.assign({}, this.defaultItem)
      this.dialog = false
    },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    formatDate(d) {
      let theDate = new Date(d)
      return ("0" + (theDate.getMonth() + 1)).slice(-2) + '/' + ("0" + theDate.getDate()).slice(-2) +
        '/' + theDate.getFullYear().toString().slice(-2)
    },
    async emitRefresh() {
      this.loadingInvestments = true
      await this.$emit('refreshInvestments', callbackVal => {
        if(callbackVal === "done") {
          this.loadingInvestments = false
        }
      })
    }
  }
}
</script>