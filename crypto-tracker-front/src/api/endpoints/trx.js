import {axiosClient} from "../axios";

export function refreshTrxs(cbaseWalletId) {
  try {
    return axiosClient.get(`/trxs?cwi=${cbaseWalletId}`)
  } catch (error) {
    alert(error)
  }
}