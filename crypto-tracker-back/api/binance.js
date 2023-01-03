import crypto from 'crypto'
import axios from 'axios'

const requirements = {
  queryString: `asset=ATOM&timestamp=${Date.now()}`,
  apiKey: 'skdb03pyGVpZXi3Dz9z02jCGBSlW9d3YCO0eoaadkVXV5c3POOMlevNrC8MMvTdm',
  secretKey: 'hjuXdvOu06Z6r9iibMbtrwHeORAmchTS9jBJY6YmJ7dB9VYH82iuiHZ5joigYVBa',
  baseUrl: 'https://api.binance.us',
  endPoint: '/sapi/v1/staking/stakingRewardsHistory',
};

const signature = crypto
    .createHmac('sha256', requirements.secretKey)
    .update(requirements.queryString)
    .digest('hex');


async function order() {
  const requestConfig = {
      method: 'GET',
      url:
          requirements.baseUrl +
          requirements.endPoint +
          '?' + requirements.queryString +
          '&signature=' +
          signature,
      headers: {
          'X-MBX-APIKEY': requirements.apiKey,
      },
  };

  try {
      const response = await axios(requestConfig);
      console.log(response);
  } catch (error) {
      console.log(error);
  }
}

  export { order }