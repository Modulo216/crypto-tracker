let coinbase = require('coinbase')
const { promisify } = require('util');

let client = new coinbase.Client({ 'apiKey': 'RYPWo266sLFKx7vz', 'apiSecret': 'MbMoUJZhoP0y2ovI5TtWoHxWnh9orBgI', strictSSL: false })

async function getUsdcTrxs() {
  const getAccountsAsync = promisify(client.getAccounts).bind(client);
  let accounts = await getAccountsAsync({limit: 300})
  let usdcWallet = accounts.find(a => a.currency === 'USDC')
  const getTxns = transactions(usdcWallet);
  let page = { next_uri: null, limit: 100 }

  let usdcTrxs = []
  do {
    let {txns, pagination} = await getTxns(page)
    page = pagination
    if(txns !== null) {
      let trxs = txns.filter(txn => new Date(txn.updated_at) > new Date('2022-06-01') && (txn.type === 'cardspend' || txn.type === 'cardbuyback'))
      trxs.forEach(txn => {
        usdcTrxs.push(txn)
      })
    }
  } while (page.next_uri !== null)

  return usdcTrxs

}

function transactions(wallet) {
  return function() {
    const args = Array.prototype.slice.call(arguments);
    return new Promise((resolve, reject) => {
      wallet.getTransactions(args[0], function(err, txns, pagination) {
        resolve({txns, pagination})
      })
    });
  };
}

export { getUsdcTrxs }