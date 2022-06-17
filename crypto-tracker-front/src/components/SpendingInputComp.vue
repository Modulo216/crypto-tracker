<template>
  <v-container>
    <v-data-table dense :headers="headers" :items="items" class="elevation-5" dark hide-default-footer>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>{{ type === 'checkingIn' ? 'Checking In' : type === 'checkingOut' ? 'Checking Out' : 'Investments' }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="800px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on" small>
                New
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ type === 'checkingIn' ? 'Checking In' : type === 'checkingOut' ? 'Checking Out' : 'Investments' }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="6">
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
                            v-model="editedItem.date"
                            label="Date"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="editedItem.date"
                          @input="dateModal = false"
                        ></v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field v-model="editedItem.amount" label="Amount" />
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
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { addChecking, updateChecking } from '../api/apollo'
export default {
  props: {
    items: Array,
    type: String
  },
  data: () => ({
    dateModal: false,
    dialog: false,
    headers: [
      { text: 'Date', sortable: false, value: 'date' },
      { text: 'Amount', sortable: false, value: 'amount' },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    editedIndex: -1,
    editedItem: {
      date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      amount: '',
    },
    defaultItem: {
      date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      amount: '',
    },
  }),
  watch: {
    dialog (val) {
      val || this.close()
    }
  },
  methods: {
    editItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      this.items.splice(this.items.indexOf(item), 1)
    },

    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.items[this.editedIndex], this.editedItem)
        updateChecking(this.editedItem)
      } else {
        this.items.push(this.editedItem)
        this.editedItem.type = this.type
        addChecking(this.editedItem)
      }
      this.close()
    },
  }
}
</script>
<style scoped>
.v-data-table header {
  height: 52px !important;
}
</style>