import axios from 'axios'

const axiosClient = axios.create({
  baseURL: `http://localhost:5001`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

export default axiosClient