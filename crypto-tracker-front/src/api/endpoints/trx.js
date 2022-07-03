import {axiosClient} from "../axios";

export function refreshTrxs() {
  return axiosClient.get('/trxs');
}