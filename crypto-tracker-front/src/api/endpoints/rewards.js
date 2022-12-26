import {axiosClient} from "../axios";

export async function refreshRewards(coins) {
  try {
    let request = `/rewards?c=${coins.map(coin => `${coin}&c=`).join('').slice(0, -3)}`
    const response = await axiosClient.get(request)
    if(response.status !== 200) {
      throw new Error(response.statusText)
    }
    return response
  } catch (error) {
    alert(error)
  }
}