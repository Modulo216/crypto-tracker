<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-data-table :headers="headers" :items="interests" sort-by="name" class="elevation-1">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Interests</v-toolbar-title>
              <v-divider class="mx-4" inset vertical />
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="800px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                    New Item
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="text-h5">Interest</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="editedItem.name" label="Coin Name" />
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="editedItem.nickName" label="Nickname" />
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="editedItem.currencyPair" label="Currency Pair" />
                        </v-col>
                        <v-col cols="12" sm="12" md="12">
                          <v-text-field v-model="editedItem.cbaseWalletId" label="Coinbase Wallet Id" />
                        </v-col>
                        <v-col cols="12" sm="12" md="12">
                          <v-text-field v-model="editedItem.wallet" label="Exchange Wallet" />
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDelete" max-width="500px">
                <v-card>
                  <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
            <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getInterests, addInterest } from '../api/apollo'
  export default {
    name: 'InterestsTable',
    data: () => ({
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: 'Name', sortable: false, value: 'name' },
        { text: 'Nick name', sortable: false, value: 'nickName' },
        { text: 'Currency Pair', sortable: false, value: 'currencyPair' },
        { text: 'Exchange Wallet', sortable: false, value: 'wallet' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      interests: [],
      editedIndex: -1,
      editedItem: {
        name: '',
        nickName: '',
        currencyPair: '',
        cbaseWalletId: '',
        wallet: ''
      },
      defaultItem: {
        name: '',
        nickName: '',
        currencyPair: '',
        cbaseWalletId: '',
        wallet: ''
      },
    }),
    created () {
      getInterests().then(r => this.interests = [...r])
    },
    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },
    methods: {
      editItem (item) {
        this.editedIndex = this.interests.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        this.editedIndex = this.interests.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        this.interests.splice(this.editedIndex, 1)
        this.closeDelete()
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      save () {
        if (this.editedIndex > -1) {
          Object.assign(this.interests[this.editedIndex], this.editedItem)
        } else {
          addInterest(this.editedItem).then(r => this.interests.push(r))
        }
        this.close()
      },
    }
  }
</script>
