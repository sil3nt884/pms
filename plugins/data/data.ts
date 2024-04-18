import mysql from 'mysql2'
import {
  ProductInput,
  ProductUpdateInput
} from '../resolvers/types/productTypes.js'

const connectionString = process.env.DBURL || ''
const connection = mysql.createConnection(connectionString)
connection.connect()

export const createProduct = (product: ProductInput) => {
  return new Promise(resolve => {
    try {
      const sql = `CALL insert_product(?)`
      connection.query(sql, [JSON.stringify(product)], (err, results) => {
        if (err) {
          throw err
        }
        resolve(results)
      })
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message)
      }
    }
  })
}

export const getProduct = (id: string): Promise<ProductInput[]> => {
  return new Promise(resolve => {
    try {
      connection.query(
        `SELECT * FROM product_variants_images WHERE id = ?`,
        [id],
        (err, results) => {
          if (err) {
            throw err
          }
          const [product]: any = results
          product.variants.forEach((varaint: any) => {
            const images = JSON.parse(varaint.images)
            varaint.images = images
          })

          resolve(product as unknown as ProductInput[])
        }
      )
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message)
      }
    }
  })
}

export const updateProduct = async (payload: ProductUpdateInput) => {
  try {
    const { id, changes } = payload
    const [productResult] = await getProduct(id)
    if (!productResult) {
      throw new Error('no product found')
    }

    if (!Object.keys(changes).length) {

      return
    }
    const now = Date.now()
    payload.changes.updated_at = Date.now()
    if (payload.changes.images) {
      payload.changes.images.forEach((image: { updated_at: number }) => {
        image.updated_at = now
      })
    }
    if (payload.changes.varaints) {
      payload.changes.varaints.forEach((variant: { updated_at: number }) => {
        variant.updated_at = now
      })
    }

    const updateProductInfo = () =>
      new Promise(resolve => {
        connection.query(
          `CALL UpdateProductInfo(?,?)`,
          [id, JSON.stringify(payload)],
          (err, results) => {
            if (err) {
              throw new Error('updated failed, ' + err)
            }
            resolve(results)
          }
        )
      })
    const updateProductResults = await updateProductInfo()
    const [updatedProduct] = await getProduct(id)
    if (updatedProduct.updated_at > productResult.updated_at) {
      return 'Updated'
    }
    return updateProductResults
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message)
    }
  }
}
