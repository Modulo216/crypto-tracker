import {axiosClient} from "../axios"

export async function refreshInvestments() {
  try {
    const response = await axiosClient.get('/investments')
    if(response.status !== 200) {
      throw new Error(response.statusText)
    }
    return response
  } catch (error) {
    alert(error)
  }
}