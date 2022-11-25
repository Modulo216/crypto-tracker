let coinbase = require('coinbase')
const { promisify } = require('util')
require('dotenv').config()
import axios from 'axios'

let client = new coinbase.Client({ 'apiKey': process.env.api_key, 'apiSecret': process.env.api_secret, strictSSL: false })

const axiosClient = axios.create({
  baseURL: `https://api.coinbase.com`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

async function getCoinPrice(coins) {
  try {
    let coinPrices = await Promise.all([...coins.map(coin => axiosClient.get(`/v2/prices/${coin}-USD/spot`))])
    let retVal = coinPrices.map(p => p.data.data)
    return retVal
  } catch (error) {
    throw new Error(error)
  }
}

async function getTrxs(walletId, loadAll) {
  try {
    const getAccountAsync = promisify(client.getAccount).bind(client)
    let wallet = await getAccountAsync(walletId)
    const getTxns = transactions(wallet)
    let trxs = []

    if(loadAll) {
      let page = { next_uri: null, limit: 100 }
      do {
        let {txns, pagination} = await getTxns(page)
        page = pagination
        if(txns !== null) {
          trxs.push(...txns)
        }
      } while (page !== undefined && page.next_uri !== null)
    } else {
      let { txns } = await getTxns({ next_uri: null, limit: 12 })
      if(txns !== null && txns.length > 0) {
        trxs.push(...txns)
      }
    }

    return trxs
  } catch (error) {
    throw new Error(error)
  }
}

function transactions(wallet) {
  return function() {
    const args = Array.prototype.slice.call(arguments)
    return new Promise((resolve, reject) => {
      wallet.getTransactions(args[0], (err, txns, pagination) => {
        resolve({txns, pagination})
      })
    })
  }
}

async function getAllAccounts() {
  try {
    const getAccountsAsync = promisify(client.getAccounts).bind(client);
    let accounts = await getAccountsAsync({ limit: 300 })
    return accounts.filter(a => a.created_at !== null && a.created_at !== a.updated_at)
      .sort((a, b) => a.currency.localeCompare(b.currency))
  } catch (error) {
    throw new Error(error)
  }
}

async function getMultiWalletTrxes(interests, loadAll) {
  try {
    let filteredAccts = await getAllAccounts()
    let retVal = []

    for (const wallet of filteredAccts) {
      console.log("COINBASE", wallet.currency)
      if(!interests.includes(wallet.currency)) {
        continue
      }

      const getTxns = transactions(wallet)
      if(loadAll) {
        let page = { next_uri: null, limit: 100 }, trxs = []
        do {
          let {txns, pagination} = await getTxns(page)
          page = pagination
          if(txns !== null) {
            trxs.push(...txns)
          }
        } while (page !== undefined && page.next_uri !== null)
        retVal.push({ coin: wallet.currency, transactions: trxs })
      } else {
        let { txns } = await getTxns({ next_uri: null, limit: 20 })
        if(txns !== null && txns.length > 0) {
          retVal.push({ coin: wallet.currency, transactions: txns })
        }
      }
    }

    return retVal
  } catch (error) {
    throw new Error(error)
  }
}

export { getTrxs, getMultiWalletTrxes, getCoinPrice }