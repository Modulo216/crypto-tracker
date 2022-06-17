import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const getInterestsGql = require('./gql/getInterests.gql')
const addInterestGql = require('./gql/addInterest.gql')
const getTrxsGql = require('./gql/getTrxs.gql')
const updateTrxGql = require('./gql/updateTrx.gql')
const deleteInterestGql = require('./gql/deleteInterest.gql')
const updateInterestGql = require('./gql/updateInterest.gql')

const httpLink = createHttpLink({ uri: 'http://localhost:5001/graphql' })

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({ addTypename: false })
})

async function getInterests() {
  const res = await apolloClient.query({ query: getInterestsGql })
  return res.data.getInterests
}

async function addInterest(interest) {
  const result = await apolloClient.mutate({
    mutation: addInterestGql,
    variables: { interest }
  })
  return result.data.addInterest
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

async function deleteInterest(id) {
  const result = await apolloClient.mutate({
    mutation: deleteInterestGql,
    variables: { id }
  })
  return result.data.deleteInterestGql
}

export { getInterests, addInterest, getTrxs, updateTrx, deleteInterest, updateInterest }