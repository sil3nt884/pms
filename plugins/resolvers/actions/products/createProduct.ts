import { createProduct as insertProduct } from '../../../data/data.js'
import { ProductInput } from '../../types/productTypes.js'
import { v4 as uuid } from 'uuid'
export const createProduct = async (productInput: ProductInput) => {
  try {
    if (!productInput) {
      throw new Error('expected body not found')
    }

    const now = Date.now()
    productInput.id = uuid()
    productInput.created_at = now
    productInput.updated_at = now
    const variantId = uuid()

    productInput.variants.forEach(variant => {
      variant.id = variantId
      variant.created_at = now
      variant.updated_at = now
      variant.price.forEach(price => {
        price.id = uuid()
        price.variant_id = variantId
      })
    })
    productInput.images.forEach(image => {
      image.variant_id = variantId
      image.created_at = now
      image.updated_at = now
    })

    const result: any = await insertProduct(productInput)
    if (result) {
      return 'created'
    } else {
      return 'failed'
    }
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message)
    }
  }
}
