# Crypto Tracker

I'll use this project to track my crypto gains and losses. Automatically it will import transactions from exchanges, and also allow manual entry for those exchanges without API's. It will periodically fetch and store price data for coins that I'm interested in. This will be used to calculate current and historical data. The frontend will show many different views including income taxes, total profit / losses w/ history, USDC savings with yield info, etc. Possibly I'll add the ability to control my mining rig's through SSH.

## Back End
Contains all the backend code. Written in Node, Express, Mongoose, and GraphQL. Requires a local MongoDB installation.
```sh
npm run start
```
## Back End
Contains all the frontend code. Written in JS, Vue, and Vuetify.
```sh
npm run start
```