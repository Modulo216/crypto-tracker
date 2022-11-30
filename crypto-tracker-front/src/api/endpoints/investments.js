import {axiosClient} from "../axios"

export function refreshInvestments() {
  try {
    return axiosClient.get('/investments')
  } catch (error) {
    alert(error)
  }
}