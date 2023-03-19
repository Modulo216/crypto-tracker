import axios from 'axios'

const axiosClient = axios.create({
  baseURL: `http://${process.env.NODE_ENV === 'development' ? 'localhost' : '192.168.86.2'}:5001`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 10000 * 90
})

export { axiosClient }