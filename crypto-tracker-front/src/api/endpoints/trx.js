import {axiosClient} from "../axios";

export function refreshTrxs(cbaseWalletId) {
  return axiosClient.get(`/trxs?cwi=${cbaseWalletId}`);
}