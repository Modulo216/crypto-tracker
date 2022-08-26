import axios from 'axios'

const axiosClient = axios.create({
  baseURL: `https://api.coingecko.com`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

export function getCoinHistory(nickName) {
  return axiosClient.get(`api/v3/coins/${nickName}/market_chart?vs_currency=USD&days=5&interval=daily`)
}