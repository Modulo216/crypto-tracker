import axios from 'axios'

const axiosClient = axios.create({
  baseURL: `https://api.coingecko.com`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

let getCoinHistory = {};
getCoinHistory.get = async (nickName) => {
  console.log("GECKO", nickName)
  await new Promise(resolve => setTimeout(resolve, 2500))
  return await axiosClient.get(`api/v3/coins/${nickName}/market_chart?vs_currency=USD&days=5&interval=daily`)
}

module.exports = getCoinHistory;