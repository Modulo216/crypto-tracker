import {axiosClient} from "../axios";

export function refreshPriceHistory() {
  return axiosClient.get('/update-history');
}