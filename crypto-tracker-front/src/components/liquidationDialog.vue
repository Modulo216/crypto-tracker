<template>
  <v-dialog v-model="show" max-width="800px">
    <v-card>
      <v-card-title>
        <span class="text-h5">New Liquidation Event</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="2">
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
              <v-text-field v-model.number="liqData.usdAmount" label="$ Proceeds" />
            </v-col>
            <v-col cols="2">
              {{ selected.length > 0 ? selected[0].coin : '' }}<br />{{ selected.map(item => item.amount).reduce((prev, next) => prev + next, 0) }}
            </v-col>
            <v-col cols="2" >
              <span v-if="modelType === 'investments'">
                Old Value<br />{{ getAsCurrency(selected.map(item => item.spent).reduce((prev, next) => prev + next, 0)) }}
              </span>
              <span v-else>
                Old Value<br />{{ getAsCurrency(selected.map(item => item.value).reduce((prev, next) => prev + next, 0)) }}
              </span>
            </v-col>

            <v-col cols="3" v-if="liqData.event === 'Swap'">
              <v-select @change="changeNewCoin" label="New Coin" v-model="liqData.newCoin" :items="this.$store.state.interests.map(r => r.name)" />
            </v-col>
            <v-col cols="3" v-if="liqData.event === 'Swap'">
              <v-text-field v-model.number="liqData.newCoinAmount" label="New Coin Amount" />
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
import { addLiquidation } from '../api/apollo'
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
      usdAmount: 0,
      newCoin: 'BTC',
      newCoinAmount: 0
    }
  }),
  computed: {
    show: {
      get () { return this.value },
      set (value) { this.$emit('input', value) }
    }
  },
  watch: {
    show(visible) {
      if (visible) {
        this.liqData[this.modelType] = this.selected.map(s => s.id)
        let price = this.$store.getters.getCoinPrice(this.selected[0].coin).price
        this.liqData.usdAmount = (price * this.selected.map(item => item.amount).reduce((prev, next) => prev + next, 0)).toFixed(2)
        let newCoinPrice = this.$store.getters.getCoinPrice(this.liqData.newCoin).price
        this.liqData.newCoinAmount = (this.liqData.usdAmount / newCoinPrice).toFixed(8)
      }
    }
  },
  methods: {
    getAsCurrency(numb) {
      return numb.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    },
    async changeNewCoin(newCoin) {
      const newCoinPrice = this.$store.getters.getCoinPrice(newCoin).price
      this.liqData.newCoinAmount = newCoinPrice === null ? 0 : (this.liqData.usdAmount / newCoinPrice).toFixed(8)
    },
    async save() {
      let liqu = await addLiquidation(this.liqData)
      if(liqu.event === 'Sell') {
        delete liqu.newCoin
        delete liqu.newCoinAmount
      }
      
      this.$store.commit('addLiquidation', liqu)
      this.$store.commit('updateLiqItems', liqu)
      this.$emit('savedLiquidation')
      Object.assign(this.$data, this.$options.data())

      this.show = false
    }
  }
}
</script>