import { updateProduct as updateProductInfo } from '../../../data/data.js'
import { ProductUpdateInput } from '../../types/productTypes.js'

export const updateProduct = async (updateProductInput: ProductUpdateInput) => {
  try {
    const updateProductResults = await updateProductInfo(updateProductInput)
    return updateProductResults
  } catch (e) {
    console.log(e)
  }
}
