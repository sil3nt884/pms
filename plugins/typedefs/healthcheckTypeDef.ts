import { gql } from 'graphql-tag'

export const healthCheckTypeDef = gql`
  type Query {
    healthcheck: String
  }
`
