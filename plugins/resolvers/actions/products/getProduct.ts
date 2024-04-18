import { getProduct as getProductById } from '../../../data/data.js'

export const getProduct = async (id: string) => {
  try {
    const product = await getProductById(id)
    return product
  } catch (e) {
    console.log(e)
  }
}
