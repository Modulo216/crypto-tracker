<template>
  <v-container>
    <v-row class="text-center">
      <h2>{{ monthNameActive }}</h2>
      <v-col cols="12">
        <v-data-table
          dark
          dense
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :headers="headers"
          :items="trxs"
          item-key="id"
          class="elevation-10"
          :footer-props="{
            'items-per-page-options': [10, 20, 30, 40, 50, 100]
          }"
          :items-per-page="30"
        >
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
              <div>{{ getAsCurrency(parseFloat(props.item.amount)) }}</div>
              <template v-slot:input>
                <div class="mt-4 text-h6">
                  Update Amount
                </div>
                <v-text-field
                  v-model="props.item.amount"
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
              <div>{{ props.item.merchant }}</div>
              <template v-slot:input>
                <div class="mt-4 text-h6">
                  Update Merchant
                </div>
                <v-text-field
                  v-model="props.item.merchant"
                  label="Edit"
                  single-line
                  counter
                  autofocus
                ></v-text-field>
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
import { updateTrx } from '../api/apollo'
  export default {
    props: {
      trxs: Array,
      monthNameActive: String,
    },
    data: () => ({
      categories: ['Bills', 'Entertainment', 'Fun', 'Gas'],
      sortBy: 'updatedAt',
      sortDesc: false,
      headers: [
        { text: 'Updated At', sortable: true, value: 'updatedAt' },
        { text: 'Merchant', sortable: false, value: 'merchant' },
        { text: 'Amount', sortable: true, value: 'amount' },
        { text: 'Category', sortable: false, value: 'category', width: '200' }
      ],
    }),
    methods: {
      save(e) {
        updateTrx(e)
      },
      formatDate(d) {
        let theDate = new Date(d)
        return ("0" + (theDate.getMonth() + 1)).slice(-2) + '/' + ("0" + theDate.getDate()).slice(-2) + '/' +
          theDate.getFullYear().toString().substr(2,2) + ' ' + theDate.toLocaleTimeString().replace(/(.*)\D\d+/, '$1')
      },
      getAsCurrency(numb) {
        return numb.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })
      }
    }
  }
</script>
