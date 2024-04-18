import { gql } from 'graphql-tag'

export const products = gql`
  type Product {
    id: ID!
    name: String!
    description: String!
    sku: String!
    created_at: String!
    updated_at: String!
    brand: String!
    category: String
    variants: [Variant!]!
  }

  type Variant {
    variant_id: ID!
    attribute_name: String!
    attribute_value: String!
    inventory: Int!
    created_at: String!
    updated_at: String!
    price: [Price!]!
    images: [Image!]!
  }

  type Price {
    price_id: ID!
    currency: String!
    price: String!
  }

  type Image {
    id: ID!
    image_url: String!
    created_at: String!
    updated_at: String!
  }

  type Query {
    getProduct(id: ID!): Product
  }

  scalar JSON

  type Query {
    getProduct(id: String!): Product
  }
`
