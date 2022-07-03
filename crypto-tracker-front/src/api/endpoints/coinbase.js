import {cbaseAxioClient} from "../axios";

export function getCoinPrice(coins) {
  let endpoints = []

  coins.forEach(coin => {
    endpoints.push(cbaseAxioClient.get(`/v2/prices/${coin}-USD/spot`))
  })

  return Promise.all([...endpoints])
}