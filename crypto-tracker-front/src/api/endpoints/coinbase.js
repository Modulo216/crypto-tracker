import {axiosClient} from "../axios"

export async function getCoinPrice(coins) {
  coins.push('USDC')
  let queryParams = '?c='
  coins.forEach(coin => {
    queryParams += `${coin}&c=`
  })
  let params = queryParams.slice(0, -3)
  return await axiosClient.get(`/coin-prices${params}`)
}