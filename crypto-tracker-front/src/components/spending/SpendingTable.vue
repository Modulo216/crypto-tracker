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
              <v-btn color="primary" dark class="ml-2" @click="dialog = true" :disabled="loadingTrxs">
                <v-icon dark>
                  mdi-plus-thick
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
              <span :style="props.item.trxType === 'manual' ? 'color: #90CAF9' : ''">
                <span v-if="props.item.merchant && props.item.merchant.length < 16">{{ props.item.merchant }}</span>
                <span v-else>{{ `${props.item.merchant ? props.item.merchant.substring(0,16) : ''}  ...` }}</span>
              </span>
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

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">New Spending Event</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="3">
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
                      :value="formatDateEdit"
                      label="Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editItem.updatedAtView"
                    @input="dateModal = false"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="3">
                <v-combobox v-model="editItem.merchant" :items="merchantNames" label="Merchant" />
              </v-col>
              <v-col cols="3">
                <v-combobox v-model="editItem.category" :items="categories" label="Categories" />
              </v-col>
              <v-col cols="3">
                <v-text-field v-model.number="editItem.amount" label="Amount" @keyup.enter="manualAdd()"/>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false;Object.assign($data.editItem, $options.data().editItem)">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="manualAdd()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { updateTrx, addTrx } from '../../api/apollo'
import { format, parseISO, formatISO } from 'date-fns'
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
      loadingTrxs: false,
      dialog: false,
      dateModal: false,
      editItem: {
        updatedAtView: formatISO(new Date()).slice(0, 10),
        updatedAt: new Date(),
        merchant: '',
        amount: 0,
        category: ''
      },
    }),
    computed: {
      formatDateEdit() {
        return this.editItem.updatedAtView ? format(parseISO(this.editItem.updatedAtView), 'MM/dd/yy') : ''
      },
    },
    methods: {
      async manualAdd() {
        this.editItem.updatedAt = new Date(this.editItem.updatedAtView + ` ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`).toISOString()
        this.editItem.exchangeId = Math.random().toString(36).slice(2, 10)
        this.editItem.trxType = 'manual'
        delete this.editItem.updatedAtView
        let itemId = await addTrx(this.editItem)
        this.editItem.id = itemId
        this.$store.commit('addTrxs', [this.editItem])
        this.dialog = false
        this.$emit('trxUpdated')
        Object.assign(this.$data.editItem, this.$options.data().editItem)
      },
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
