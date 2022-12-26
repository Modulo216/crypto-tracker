<template>
  <v-container class="pa-1">
    <v-row class="text-center">
      <v-col cols="12">
        <v-data-table v-model="selected" show-select dark dense :loading="loadingTaxes" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :headers="headers" :items="taxes" item-key="exchangeId" class="elevation-10" hide-default-footer disable-pagination>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>{{ monthNameActive !== 'ALL' ? `${$store.getters.getMonthNames[monthNameActive.month]} - ${monthNameActive.year}` : 'ALL' }} Taxes</v-toolbar-title>
              <v-spacer></v-spacer>
              <span>{{ `${taxes.length} transactions` }}</span>
              <v-btn color="primary" dark class="ml-2" @click="emitRefresh()" :loading="loadingTaxes" :disabled="loadingTaxes">
                <v-icon dark>
                  mdi-refresh
                </v-icon>
              </v-btn>
              <!-- <v-btn color="primary" dark class="ml-2" @click="dialog = true" :disabled="loadingTaxes">
                <v-icon dark>
                  mdi-plus-thick
                </v-icon>
              </v-btn> -->
              <download-excel :data="taxes">
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
                <span v-if="selected.length > 0">{{ selected.map(item => parseFloat(item.amount)).reduce((prev, next) => prev + next, 0)}}</span>
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:[`header.data-table-select`]></template>
          <template v-slot:[`item.data-table-select`]="{ item, isSelected, select }">
            <v-simple-checkbox :value="isSelected" :readonly="item.liquidation !== null" :disabled="item.liquidation !== null" @input="select($event)" />
          </template>
          <template v-slot:[`item.updatedAt`]="{ item }">
            <span>{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template v-slot:[`item.value`]="props">
            <div>{{ getAsCurrency(parseFloat(props.item.value)) }}</div>
          </template>
          <template v-slot:[`item.activity`]="props">
            <v-edit-dialog
              :return-value.sync="props.item.activity"
              @save="save(props.item)"
              large
              persistent
            >
              <div>{{ props.item.activity }}</div>
              <template v-slot:input>
                <div class="mt-4 text-h6">
                  Update Activity
                </div>
                <v-combobox
                  v-model="props.item.activity"
                  :items="activities"
                  dense
                />
              </template>
            </v-edit-dialog>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">New Tax Event</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="4">
                <v-menu
                  v-model="dateModal"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      :value="formatDateDb"
                      label="Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editItem.updatedAt"
                    @input="dateModal = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="4">
                <v-combobox v-model="editItem.exchange" :items="exchanges" label="Exchange" />
              </v-col>
              <v-col cols="4">
                <v-combobox v-model="editItem.activity" :items="activities" label="Activity" />
              </v-col>
              <v-col cols="4">
                <v-combobox v-model="editItem.coin" :items="coins" label="Coin" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model="editItem.amount" label="Amount" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model="editItem.value" label="value" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false;editItem = Object.assign({}, defaultItem)">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="addTax">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
    <liquidation-dialog v-model="showLiquidationDialog" :selected="selected" modelType="Tax" @savedLiquidation="(liq) => { $store.commit('updateLiqItems', { items: selected, liq: liq });selected = [] }" />
  </v-container>
</template>
<script>
import { updateTax, addTax } from '../../api/apollo'
import { format, parseISO } from 'date-fns'
import LiquidationDialog from '../liquidationDialog'
export default {
  props: {
    taxes: Array,
    activities: Array,
    monthNameActive: {},
    coins: Array,
    exchanges: Array
  },
  components: {
    LiquidationDialog
  },
  data: () => ({
    selected: [],
    showLiquidationDialog: false,
    sortBy: 'updatedAt',
    sortDesc: true,
    headers: [
      { text: 'Updated At', sortable: true, value: 'updatedAt' },
      { text: 'Exchange', sortable: false, value: 'exchange' },
      { text: 'Activity', sortable: false, value: 'activity' },
      { text: 'Coin', sortable: true, value: 'coin' },
      { text: 'Amount', sortable: false, value: 'amount' },
      { text: 'Tax', sortable: true, value: 'value' }
    ],
    loadingTaxes: false,
    // dateModal: false,
    // dialog: false,
    // defaultItem: {
    //   updatedAt: format(parseISO(new Date().toISOString()), 'yyyy-MM-dd'),
    //   exchange: '',
    //   activity: '',
    //   coin: '',
    //   amount: '',
    //   value: '',
    // },
    // editItem: {
    //   updatedAt: format(parseISO(new Date().toISOString()), 'yyyy-MM-dd'),
    //   exchange: '',
    //   activity: '',
    //   coin: '',
    //   amount: '',
    //   value: '',
    // },
  }),
  // computed: {
  //   formatDateDb() {
  //     return this.editItem.updatedAt ? format(parseISO(this.editItem.updatedAt), 'MM/dd/yy') : ''
  //   },
  // },
  methods: {
    save(e) {
      updateTax(e)
      this.$emit('taxUpdated', e)
    },
    // addTax() {
    //   addTax(this.editItem)
    //   this.$emit('taxAdded', this.editItem)
    //   this.editItem = Object.assign({}, this.defaultItem)
    //   this.dialog = false
    // },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    formatDate(d) {
      let theDate = new Date(d)
      if(d.length === 10) {
        return ("0" + (theDate.getUTCMonth() + 1)).slice(-2) + '/' + ("0" + theDate.getUTCDate()).slice(-2)
      } else {
        return ("0" + (theDate.getMonth() + 1)).slice(-2) + '/' + ("0" + theDate.getDate()).slice(-2)
      }
    },
    async emitRefresh() {
      this.loadingTaxes = true
      await this.$emit('refreshTax', callbackVal => {
        if(callbackVal === "done") {
          this.loadingTaxes = false
        }
      });
    }, format, parseISO
  }
}
</script>