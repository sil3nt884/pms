import { v4 as uuid } from 'uuid'
import mysql from 'mysql2'

type Price = {
  amount: number
  currency: string
  id?: string
  variant_id?: string
}

type Variant = {
  attribute_name: string
  attribute_value: string
  inventory: number
  price: Price[]
  id?: string
  created_at?: number
  updated_at?: number
}

type Image = {
  image_url: string
  variant_id?: string
  id?: string
  created_at?: number
  updated_at?: number
}

type ProductInput = {
  brand: string
  description: string
  sku: string
  name: string
  category_id?: string
  images: Image[]
  variants: Variant[]
  id?: string
  created_at?: number
  updated_at?: number
}

const createProducts = (numProducts: number): ProductInput[] => {
  const products: ProductInput[] = []

  for (let i = 1; i <= numProducts; i++) {
    const now = Date.now()
    const productId = uuid()
    const variantId = uuid()

    const product: ProductInput = {
      name: `Product ${i}`,
      description: `Product ${i} description`,
      brand: `Brand ${i}`,
      sku: `SKU${i}`,
      images: [
        {
          image_url: `https://example.com/product_${i}.jpg`,
          variant_id: variantId,
          id: uuid(),
          created_at: now,
          updated_at: now
        }
      ],
      variants: [
        {
          attribute_name: `Attribute ${i}`,
          attribute_value: `Value ${i}`,
          inventory: 10,
          price: [
            {
              amount: i * 10,
              currency: i % 2 === 0 ? 'USD' : 'GBP',
              id: uuid(),
              variant_id: variantId
            }
          ],
          id: variantId,
          created_at: now,
          updated_at: now
        }
      ],
      id: productId,
      created_at: now,
      updated_at: now
    }

    products.push(product)
  }

  return products
}

const connectionString =
  'mysql://admin:R.lfirehells911@88.97.10.194:3306/ecommerce'
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
;(async () => {
  const products = createProducts(100)
  await Promise.all(products.map(product => createProduct(product)))
  console.log('completed')
})()
