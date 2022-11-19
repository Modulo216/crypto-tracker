<template>
  <v-dialog v-model="show" max-width="800px">
    <v-card>
        <v-card-title>
          <span class="text-h5">New Liquidation Event</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="3">
                <v-select label="Event" v-model="liqData.event" :items="['Sell', 'Swap']" />
              </v-col>
              <v-col cols="3">
                <v-dialog ref="dialog" v-model="dateModal" :return-value.sync="liqData.updatedAt" persistent width="290px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="liqData.updatedAt" label="Liquidation Date" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on" />
                  </template>
                  <v-date-picker v-model="liqData.updatedAt" scrollable>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="dateModal = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.dialog.save(liqData.updatedAt)">OK</v-btn>
                  </v-date-picker>
                </v-dialog>
              </v-col>
              <v-col cols="3">
                <v-text-field v-model="liqData.usdAmount" label="$ Proceeds" />
              </v-col>
              <v-col cols="3">
                <v-checkbox v-model="liqData.taxable" label="Taxable?" />
              </v-col>
              <v-col cols="3" v-if="liqData.event === 'Swap'">
                <v-select label="New Coin" v-model="liqData.newCoin" :items="this.$store.state.interests.map(r => r.name)" />
              </v-col>
              <v-col cols="3" v-if="liqData.event === 'Swap'">
                <v-text-field v-model="liqData.newCoinAmount" label="New Coin Amount" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click.stop="Object.assign($data, $options.data());show=false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="save">Save</v-btn>
        </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { addLiquidation, getLiquidation } from '../api/apollo'
export default {
  props: {
    modelType: String,
    value: Boolean,
    selected: Array
  },
  data: () => ({
    dateModal: false,
    liqData: {
      updatedAt: new Date().toISOString().substr(0, 10),
      event: 'Swap',
      taxable: true,
      usdAmount: '',
      newCoin: 'BTC',
      newCoinAmount: ''
    }
  }),
  computed: {
    show: {
      get () { return this.value },
      set (value) { this.$emit('input', value) }
    }
  },
  methods: {
    async save() {
      const liq = { ...this.liqData, model_type: this.modelType, liquid: this.selected.map(s => s.id) }
      if(this.liqData.event === 'Sell') {
        delete liq.newCoin
        delete liq.newCoinAmount
      }
      await addLiquidation(liq)
      this.show = false
      this.$emit('savedLiquidation', liq)
    }
  }
}
</script>