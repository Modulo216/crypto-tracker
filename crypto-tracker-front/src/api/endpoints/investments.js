import {axiosClient} from "../axios"

export function refreshInvestments() {
  return axiosClient.get('/investments')
}