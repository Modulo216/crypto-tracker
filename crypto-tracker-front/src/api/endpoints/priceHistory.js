import {axiosClient} from "../axios";

export async function refreshPriceHistory() {
  try {
    const response = await axiosClient.get('/update-history2')
    if(response.status !== 200) {
      throw new Error(response.statusText)
    }
    return response
  } catch (error) {
    alert(error)
  }
}

export async function refreshStockPriceHistory(dates) {
  try {
    const response = await axiosClient.post('/update-stock-history', { dates: dates })
    if(response.status !== 200) {
      throw new Error(response.statusText)
    }
    return response
  } catch (error) {
    alert(error)
  }
}