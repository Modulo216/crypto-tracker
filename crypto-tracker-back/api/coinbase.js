let coinbase = require('coinbase')
const { promisify } = require('util');

let client = new coinbase.Client({ 'apiKey': 'RYPWo266sLFKx7vz', 'apiSecret': 'MbMoUJZhoP0y2ovI5TtWoHxWnh9orBgI', strictSSL: false })

async function doIt() {
  const getAccountsAsync = promisify(client.getAccounts).bind(client);
  let accounts = await getAccountsAsync({limit: 300})
  let btcWallet = accounts.find(a => a.currency === 'BTC')
  return btcWallet.balance
}

export { doIt }