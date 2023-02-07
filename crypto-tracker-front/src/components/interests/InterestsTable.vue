<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-data-table dense :headers="headers" :items="$store.state.interests" sort-by="name" class="elevation-10" dark hide-default-footer disable-pagination>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Interests</v-toolbar-title>
              <v-divider class="mx-4" inset vertical />
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="800px" persistent>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                    New Interest
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="text-h5">Interest</span>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col sm="12" md="6" lg="4">
                          <v-text-field v-model="editedItem.name" label="Coin Name" />
                        </v-col>
                        <v-col sm="12" md="6" lg="4">
                          <v-text-field v-model="editedItem.nickName" label="Nickname" />
                        </v-col>
                        <v-col sm="12" md="12" lg="4">
                          <v-text-field v-model="editedItem.cbaseWalletId" label="Coinbase Wallet Id" />
                        </v-col>
                        <v-col cols="4">
                          <v-checkbox v-model="editedItem.isTax" label="Taxable?" />
                        </v-col>
                        <v-col cols="4">
                          <v-checkbox v-model="editedItem.isReward" label="Rewards?" />
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="dialogDelete" max-width="500px" persistent>
                <v-card>
                  <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
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
import { addInterest, deleteInterest, updateInterest, delReward } from '../../api/apollo'
  export default {
    name: 'interests-table',
    data: () => ({
      dialog: false,
      dialogDelete: false,
      headers: [
        { text: 'Name', sortable: true, value: 'name' },
        { text: 'Nick name', sortable: false, value: 'nickName' },
        { text: 'Tax', sortable: false, value: 'isTax' },
        { text: 'Reward', sortable: false, value: 'isReward' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      editedItem: {
        name: '',
        nickName: '',
        currencyPair: '',
        cbaseWalletId: '',
        wallet: '',
        isTax: false,
        isReward: false
      },
      defaultItem: {
        name: '',
        nickName: '',
        currencyPair: '',
        cbaseWalletId: '',
        wallet: '',
        isTax: false,
        isReward: false
      },
    }),
    methods: {
      delReward,
      editItem (item) {
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },
      deleteItem (item) {
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },
      closeDialog() {
        this.dialog = false
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
        })
      },
      deleteItemConfirm () {
        deleteInterest(this.editedItem.id)
        this.$store.commit('removeInterest', this.editedItem.id)
        this.closeDialog()
      },
      save () {
        if(this.editedItem.id === undefined) {
          addInterest(this.editedItem).then(r =>  this.$store.commit('addInterest', r))
        } else {
          updateInterest(this.editedItem)
          this.$store.commit('updatedInterest', this.editedItem)
        }
        this.$store.commit('setChartHistory', [])
        this.closeDialog()
      },
    }
  }
</script>
