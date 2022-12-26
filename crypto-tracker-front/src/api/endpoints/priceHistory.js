import {axiosClient} from "../axios";

export async function refreshPriceHistory() {
  try {
    const response = await axiosClient.get('/update-history')
    if(response.status !== 200) {
      throw new Error(response.statusText)
    }
    return response
  } catch (error) {
    alert(error)
  }
}