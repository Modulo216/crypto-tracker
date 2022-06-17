let coinbase = require('coinbase')
const { promisify } = require('util')
require('dotenv').config()

let client = new coinbase.Client({ 'apiKey': process.env.api_key, 'apiSecret': process.env.api_secret, strictSSL: false })

async function getTrxs(walletId) {
  const getAccountAsync = promisify(client.getAccount).bind(client);
  let wallet = await getAccountAsync(walletId)
  const getTxns = transactions(wallet);
  
  let page = { next_uri: null, limit: 100 }
  let trxs = []
  do {
    let {txns, pagination} = await getTxns(page)
    page = pagination
    if(txns !== null) {
      txns.forEach(txn => {
        trxs.push(txn)
      })
    }
  } while (page !== undefined && page.next_uri !== null)

  return trxs

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

export { getTrxs }