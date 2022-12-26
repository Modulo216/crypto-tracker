import {axiosClient} from "../axios";

export async function refreshTaxes(coins) {
  try {
    coins.push('ETH2')
    let request = `/taxes?c=${coins.map(coin => `${coin}&c=`).join('').slice(0, -3)}`
    const response =  await axiosClient.get(request)
    if(response.status !== 200) {
      throw new Error(response.statusText)
    }
    return response
  } catch (error) {
    alert(error)
  }
}