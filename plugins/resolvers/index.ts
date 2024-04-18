import { healthcheck } from './actions/health/health.js'
import { createProduct as productInsert } from './actions/products/createProduct.js'
import { ProductInput, ProductUpdateInput } from './types/productTypes.js'
import { updateProduct } from '../resolvers/actions/products/updateProduct.js'
import { getProduct as getProductById } from './actions/products/getProduct.js'

export const resolvers = () => {
  return {
    queries: {
      healthcheck,
      getProduct: (__: any, productId: { id: string }) => {
        return getProductById(productId.id)
      }
    },
    mutations: {
      updateProduct: (
        __: any,
        updateProductInput: { updateProduct: ProductUpdateInput }
      ) => {
        const r = updateProduct(updateProductInput.updateProduct)
        return r
      },
      createProduct: async (
        __: any,
        productInput: { product: ProductInput }
      ) => {

        const results = await productInsert(productInput.product)
        return results
      }
    }
  }
}
