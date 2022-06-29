<template>
  <v-container class="pa-1">
    <v-data-table dense :headers="headers" :items="items.filter(i => i.type === type)" class="elevation-5" dark hide-default-footer>
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
                            :value="formatDate"
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
      <template v-slot:[`item.date`]="{ item }">
        <span>{{ format(parseISO(item.date), 'MM/dd/yy') }}</span>
      </template>
      <template v-slot:[`item.amount`]="{ item }">
        <span>{{ getAsCurrency(parseFloat(item.amount)) }}</span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { format, parseISO } from 'date-fns'
export default {
  props: {
    items: Array,
    type: String
  },
  data: (instance) => ({
    dateModal: false,
    dialog: false,
    headers: [
      { text: 'Date', sortable: false, value: 'date' },
      { text: 'Amount', sortable: false, value: 'amount' },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    editedItem: {
      date: format(parseISO(new Date().toISOString()), 'yyyy-MM-dd'),
      amount: '',
      type: instance.type
    },
    defaultItem: {
      date: format(parseISO(new Date().toISOString()), 'yyyy-MM-dd'),
      amount: '',
      type: instance.type
    },
  }),
  computed: {
    formatDate() {
      return this.editedItem.date ? format(parseISO(this.editedItem.date), 'MM/dd/yy') : ''
    }
  },
  watch: {
    dialog (val) {
      val || this.close()
    }
  },
  methods: {
    editItem (item) {
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem (item) {
      this.$emit('removeItem', item)
    },
    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
      })
    },
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    save () {
      this.$emit('saveItem', this.editedItem)
      this.close()
    }, format, parseISO
  }
}
</script>
<style scoped>
.v-data-table header {
  height: 52px !important;
}
</style>