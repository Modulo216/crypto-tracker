import axios from 'axios'

const axiosClient = axios.create({
  baseURL: `http://be:5001`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

const cbaseAxioClient = axios.create({
  baseURL: `https://api.coinbase.com`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

export { axiosClient, cbaseAxioClient}