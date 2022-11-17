<template>
  <v-dialog v-model="show" max-width="800px">
    <v-card>
        <v-card-title>
          <span class="text-h5">New Liquidation Event</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="4">
                {{ selected.map(s => s.id) }}
                <v-text-field v-model="updatedAt" label="Date" />
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
     value: Boolean,
     selected: Array
  },
  data: () => ({
    updatedAt: ''
  }),
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
         this.$emit('input', value)
      }
    }
  },
  methods: {
    async save() {
      // const liq = { updatedAt: 'eee', coin: 'BTC', coinAmount: '4848',
      //   event: 'adsf', usdAmount: '123', model_type: 'Reward', liquid: this.selected.map(s => s.id)}
      // addLiquidation(liq)
      let res = await getLiquidation()
      console.log("T", res)
    }
  }
}
</script>