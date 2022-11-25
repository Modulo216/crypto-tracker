import {axiosClient} from "../axios"

export async function getCoinPrice(coins) {
  coins.push('USDC')
  let request = `/coin-prices?c=${coins.map(coin => `${coin}&c=`).join('').slice(0, -3)}`
  return await axiosClient.get(request)
}