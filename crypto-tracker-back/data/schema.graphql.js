import { gql } from "apollo-server-express"

export const typeDefs = gql`
  type Interest {
    id: ID
    nickName: String
  }
  input InterestInput {
    nickName: String
  }
  type Query {
    getInterests: [Interest]
    findInterests(interest: InterestInput): [Interest]
  }
  type Mutation {
    addInterest(interest: InterestInput): Interest
  }
`