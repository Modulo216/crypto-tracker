import {axiosClient} from "../axios";

export function refreshPriceHistory() {
  try {
    return axiosClient.get('/update-history')
  } catch (error) {
    alert(error)
  }
}