import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const getInterestsGql = require('./gql/getInterests.gql')
const addInterestGql = require('./gql/addInterest.gql')
const getTrxsGql = require('./gql/getTrxs.gql')
const updateTrxGql = require('./gql/updateTrx.gql')
const deleteInterestGql = require('./gql/deleteInterest.gql')
const deleteCheckingGql = require('./gql/deleteChecking.gql')
const updateInterestGql = require('./gql/updateInterest.gql')
const addCheckingGql = require('./gql/addChecking.gql')
const updateCheckingGql = require('./gql/updateChecking.gql')
const getCheckingGql = require('./gql/getChecking.gql')

const httpLink = createHttpLink({ uri: 'http://localhost:5001/graphql' })

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

async function updateTrx(trx) {
  const result = await apolloClient.mutate({
    mutation: updateTrxGql,
    variables: { trx }
  })
  return result.data.updateTrx
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

export { getInterests, addInterest, getTrxs, updateTrx, deleteInterest,
  updateInterest, getChecking, addChecking, updateChecking, deleteChecking }