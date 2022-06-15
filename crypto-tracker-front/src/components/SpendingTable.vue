<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-data-table
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
          <template v-slot:item.updatedAt="{ item }">
            <span>{{ new Date(item.updatedAt).toLocaleString() }}</span>
          </template>
          <template v-slot:item.merchant="props">
            <v-edit-dialog
              :return-value.sync="props.item.merchant"
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
          <template v-slot:item.category="{ item }">
            <v-select
              v-model="item.category"
              :items="categories"
            ></v-select>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getInterests, addInterest } from '../api/apollo'
  export default {
    props: {
      trxs: Array
    },
    data: () => ({
      categories: ['Bills', 'Entertainment', 'Fun'],
      sortBy: 'updatedAt',
      sortDesc: false,
      headers: [
        { text: 'Updated At', sortable: true, value: 'updatedAt' },
        { text: 'Merchant', sortable: false, value: 'merchant' },
        { text: 'Amount', sortable: false, value: 'amount' },
        { text: 'Category', sortable: false, value: 'category', width: '200' }
      ],
    }),
    methods: {

    }
  }
</script>
