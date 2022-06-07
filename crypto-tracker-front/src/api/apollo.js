import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const getInterestsGql = require('./gql/getInterests.gql')
const addInterestGql = require('./gql/addInterest.gql')

const httpLink = createHttpLink({
  uri: 'http://localhost:5001/graphql',
})

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

async function getInterests() {
  const res = await apolloClient.query({ query: getInterestsGql })
  return res.data.getInterests
}

async function addInterest(interest) {
  const result = await apolloClient.mutate({
    mutation: addInterestGql,
    variables: {
      nickName: interest.nickName,
      name: interest.name,
      currencyPair: interest.currencyPair,
      walletId: interest.walletId,
    },
  })
  return result.data.addInterest
}

export { getInterests, addInterest }