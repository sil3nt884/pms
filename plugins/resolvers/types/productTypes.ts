export interface Variant {
  id: string
  attribute_name: string
  attribute_value: string
  inventory: number
  created_at: number
  updated_at: number
  price_id: string
  price: [
    {
      id: string
      amount: number
      currency: string
      variant_id: string
    }
  ]
}

export interface Image {
  variant_id: string
  image_url: string
  created_at: number
  updated_at: number
}

export interface ProductInput {
  id: string
  name: string
  description: string
  sku: string
  brand: string
  category?: string
  images: Image[]
  variants: Variant[]
  created_at: number
  updated_at: number
}

export interface ProductUpdateInput {
  id: string
  changes: { [key: string]: any }
}
