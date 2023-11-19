import axios from 'axios'

const axiosClient = axios.create({
  timeout: 70000,
  baseURL: `https://eds.ecs.gisp.c1.vanguard.com`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

async function getStockPrices(stockId) {
  console.log("STOCKPRICE", stockId)
  let todayStr = new Date().toISOString().slice(0,10)
  let oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 30);
  let retVal = await axiosClient.get(`/eds-eip-distributions-service/price/daily-nav-history/${stockId}.json?start-date=${oneWeekAgo.toISOString().slice(0,10)}&end-date=${todayStr}`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  return retVal.data[0].priceItem
}

export { getStockPrices }