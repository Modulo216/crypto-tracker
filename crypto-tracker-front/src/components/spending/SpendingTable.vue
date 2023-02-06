<template>
  <v-container class="pa-1">
    <v-row class="text-center">
      <v-col cols="12">
        <v-data-table
          dark
          dense
          :loading="loadingTrxs"
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :headers="headers"
          :items="trxs"
          item-key="id"
          class="elevation-10"
          hide-default-footer
          disable-pagination
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>{{ monthNameActive !== 'ALL' ? `${$store.getters.getMonthNames[monthNameActive.month]} - ${monthNameActive.year}` : 'ALL' }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <span>{{ `${trxs.length} transactions` }}</span>
              <v-btn color="primary" dark class="ml-2" @click="emitRefresh()" :loading="loadingTrxs" :disabled="loadingTrxs">
                <v-icon dark>
                  mdi-refresh
                </v-icon>
              </v-btn>
              <download-excel :data="trxs">
                <v-btn color="primary" dark class="ml-2">
                  <v-icon dark>
                    mdi-download
                  </v-icon>
                </v-btn>
              </download-excel>
            </v-toolbar>
          </template>
          <template v-slot:[`item.index`]="{ item }">
            <span>{{  trxs.indexOf(item) }}</span>
          </template>
          <template v-slot:[`item.updatedAt`]="{ item }">
            <span>{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template v-slot:[`item.amount`]="props">
            <v-edit-dialog
              :return-value.sync="props.item.amount"
              @save="save(props.item)"
              large
              persistent
            >
              <div>{{ getAsCurrency(props.item.amount) }}</div>
              <template v-slot:input>
                <div class="mt-4 text-h6">
                  Update Amount
                </div>
                <v-text-field
                  v-model.number="props.item.amount"
                  label="Edit"
                  single-line
                  counter
                  autofocus
                ></v-text-field>
              </template>
            </v-edit-dialog>
          </template>
          <template v-slot:[`item.merchant`]="props">
            <v-edit-dialog
              :return-value.sync="props.item.merchant"
              @save="save(props.item)"
              large
              persistent
            >
              <span v-if="props.item.merchant && props.item.merchant.length < 16">{{ props.item.merchant }}</span>
              <span v-else>{{ `${props.item.merchant ? props.item.merchant.substring(0,16) : ''}  ...` }}</span>
              <template v-slot:input>
                <div class="mt-4 text-h6">
                  Update Merchant
                </div>
                <v-combobox
                  v-model="props.item.merchant"
                  :items="merchantNames"
                  dense
                  label="Merchant Name"
                />
              </template>
            </v-edit-dialog>
          </template>
          <template v-slot:[`item.category`]="{ item }">
            <v-select
              v-model="item.category"
              :items="categories"
              dense 
              @change="save(item)"
            ></v-select>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { updateTrx } from '../../api/apollo'
  export default {
    props: {
      trxs: Array,
      monthNameActive: {},
      merchantNames: Array
    },
    data: () => ({
      categories: ['Auto + Gas','Cable + Phone','Merchandise','Entertainment','Gifts','Groceries','Healthcare',
        'Insurance','Other','Personal + Family','Pets','Rent','Restaurants','Services + Supplies','Utilities'],
      sortBy: 'updatedAt',
      sortDesc: true,
      headers: [
        { text: '', sortable: false, value: 'index' },
        { text: 'Updated At', sortable: true, value: 'updatedAt' },
        { text: 'Merchant', sortable: false, value: 'merchant' },
        { text: 'Amount', sortable: true, value: 'amount' },
        { text: 'Category', sortable: false, value: 'category', width: '180' }
      ],
      loadingTrxs: false
    }),
    methods: {
      save(e) {
        updateTrx(e)
        this.$emit('trxUpdated', e)
      },
      formatDate(d) {
        let theDate = new Date(d)
        return ("0" + (theDate.getMonth() + 1)).slice(-2) + '/' + ("0" + theDate.getDate()).slice(-2) +
          ' ' + theDate.toLocaleTimeString().replace(/(.*)\D\d+/, '$1')
      },
      getAsCurrency(numb) {
        return numb.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })
      },
      async emitRefresh() {
        this.loadingTrxs = true
        await this.$emit('refreshTrx', callbackVal => {
          if(callbackVal === "done") {
            this.loadingTrxs = false
          }
        });
      }
    }
  }
</script>
