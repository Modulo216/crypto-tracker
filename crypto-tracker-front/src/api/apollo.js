import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const getInterestsGql = require('./gql/getInterests.gql')
const addInterestGql = require('./gql/addInterest.gql')
const addTaxGql = require('./gql/addTax.gql')
const getTrxsGql = require('./gql/getTrxs.gql')
const updateTrxGql = require('./gql/updateTrx.gql')
const updateTaxGql = require('./gql/updateTax.gql')
const deleteInterestGql = require('./gql/deleteInterest.gql')
const deleteCheckingGql = require('./gql/deleteChecking.gql')
const updateInterestGql = require('./gql/updateInterest.gql')
const addCheckingGql = require('./gql/addChecking.gql')
const updateCheckingGql = require('./gql/updateChecking.gql')
const getCheckingGql = require('./gql/getChecking.gql')
const getTaxesGql = require('./gql/getTaxes.gql')
const getRewardsGql = require('./gql/getRewards.gql')
const getPHistoryGql = require('./gql/getPHistory.gql')
const getInvestmentsGql = require('./gql/getInvestments.gql')
const addInvestmentGql = require('./gql/addInvestment.gql')
const delRewardGql = require('./gql/delReward.gql')
const addLiquidationGql = require('./gql/addLiquidation.gql')
const getLiquidationGql = require('./gql/getLiquidation.gql')

const httpLink = createHttpLink({ uri: `http://${process.env.NODE_ENV === 'development' ? 'localhost' : '192.168.86.2'}:5001/graphql` })

async function getLiquidation() {
  const res = await apolloClient.query({ query: getLiquidationGql })
  return res.data.getLiquidation
}

async function delReward(id) {
  const result = await apolloClient.mutate({
    mutation: delRewardGql,
    variables: { id }
  })
  return result.data.delReward
}

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({ addTypename: false }),
  defaultOptions: defaultOptions
})

async function getInterests() {
  const res = await apolloClient.query({ query: getInterestsGql })
  return res.data.getInterests
}

async function getChecking() {
  const res = await apolloClient.query({ query: getCheckingGql })
  return res.data.getChecking
}

async function addInterest(interest) {
  const result = await apolloClient.mutate({
    mutation: addInterestGql,
    variables: { interest }
  })
  return result.data.addInterest
}

async function addTax(tax) {
  const result = await apolloClient.mutate({
    mutation: addTaxGql,
    variables: { tax }
  })
  return result.data.addTax
}

async function addInvestment(investment) {
  const result = await apolloClient.mutate({
    mutation: addInvestmentGql,
    variables: { investment }
  })
  return result.data.addInvestment
}

async function addLiquidation(liquidation) {
  if(liquidation.event === 'Sell') {
    delete liquidation.newCoin
    delete liquidation.newCoinAmount
  }
  liquidation.updatedAt = new Date(liquidation.updatedAtView)
  const result = await apolloClient.mutate({
    mutation: addLiquidationGql,
    variables: { liquidation }
  })
  let retVal = result.data.addLiquidation
  if(liquidation.event === 'Sell') {
    delete retVal.newCoin
    delete retVal.newCoinAmount
  }
  return retVal
}

async function addChecking(checking) {
  const result = await apolloClient.mutate({
    mutation: addCheckingGql,
    variables: { checking }
  })
  return result.data.addChecking
}

async function updateInterest(interest) {
  const result = await apolloClient.mutate({
    mutation: updateInterestGql,
    variables: { interest }
  })
  return result.data.updateInterest
}

async function getTrxs() {
  const res = await apolloClient.query({ query: getTrxsGql })
  return res.data.getTrxs
}

async function getRewards() {
  const res = await apolloClient.query({ query: getRewardsGql })
  //return res.data.getRewards.filter(r => isAfter(new Date(r.updatedAt), new Date(2022, 0, 1)))
  return res.data.getRewards
}

async function getTaxes() {
  const res = await apolloClient.query({ query: getTaxesGql })
  return res.data.getTaxes
}

async function getPHistory() {
  const res = await apolloClient.query({ query: getPHistoryGql })
  return res.data.getPHistory
}

async function getInvestments() {
  const res = await apolloClient.query({ query: getInvestmentsGql })
  return res.data.getInvestments
}

async function updateTrx(trx) {
  const result = await apolloClient.mutate({
    mutation: updateTrxGql,
    variables: { trx }
  })
  return result.data.updateTrx
}

async function updateTax(tax) {
  const result = await apolloClient.mutate({
    mutation: updateTaxGql,
    variables: { tax }
  })
  return result.data.updateTax
}

async function updateChecking(checking) {
  const result = await apolloClient.mutate({
    mutation: updateCheckingGql,
    variables: { checking }
  })
  return result.data.updateChecking
}

async function deleteInterest(id) {
  const result = await apolloClient.mutate({
    mutation: deleteInterestGql,
    variables: { id }
  })
  return result.data.deleteInterest
}

async function deleteChecking(id) {
  const result = await apolloClient.mutate({
    mutation: deleteCheckingGql,
    variables: { id }
  })
  return result.data.deleteChecking
}

export { getInterests, addInterest, getTrxs, updateTrx, deleteInterest, getRewards, getInvestments, addInvestment, getPHistory,
  getLiquidation, addLiquidation, delReward, updateInterest, getChecking, addChecking, updateChecking, deleteChecking, getTaxes, updateTax, addTax }