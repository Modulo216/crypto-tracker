import {axiosClient} from "../axios";

export function refreshRewards(coins) {
  try {
    let request = `/rewards?c=${coins.map(coin => `${coin}&c=`).join('').slice(0, -3)}`
    return axiosClient.get(request)
  } catch (error) {
    alert(error)
  }
}