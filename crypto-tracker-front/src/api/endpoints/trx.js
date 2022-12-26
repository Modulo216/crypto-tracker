import {axiosClient} from "../axios";

export async function refreshTrxs(cbaseWalletId) {
  try {
    const response = await axiosClient.get(`/trxs?cwi=${cbaseWalletId}`)
    if(response.status !== 200) {
      throw new Error(response.statusText)
    }
    return response
  } catch (error) {
    alert(error)
  }
}