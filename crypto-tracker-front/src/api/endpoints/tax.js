import {axiosClient} from "../axios";

export function refreshTaxes(coins) {
  coins.push('ETH2')
  let request = `/taxes?c=${coins.map(coin => `${coin}&c=`).join('').slice(0, -3)}`
  return axiosClient.get(request);
}