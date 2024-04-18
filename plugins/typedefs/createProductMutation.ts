import { gql } from 'graphql-tag'

export const producrt = gql`
  type Variant {
    id: String
    attribute_name: String!
    attribute_value: String!
    inventory: Int!
  }

  type Image {
    id: ID!
    variant_id: String
    image_url: String!
  }

  input ProductInput {
    name: String!
    description: String!
    sku: String!
    brand: String

    images: [ImageInput!]!
    variants: [VariantInput!]!
  }

  input PriceInput {
    amount: Int
    currency: String
  }

  input ProductInputOption {
    name: String
    description: String
    sku: String
    price: [PriceInput!]
    images: [ImageInput]
    variants: [VariantInput]
  }

  input VariantInput {
    price: [PriceInput!]
    attribute_name: String!
    attribute_value: String!
    inventory: Int!
  }

  input ImageInput {
    image_url: String!
  }

  input UpdateInput {
    id: String
    changes: ProductInputOption
  }

  type Mutation {
    createProduct(product: ProductInput): String
    updateProduct(updateProduct: UpdateInput): String
  }
`
