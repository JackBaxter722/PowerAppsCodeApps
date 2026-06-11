import { db, delay, nextId } from './db'
import { type Product } from './types'

export async function getProducts(): Promise<Product[]> {
  return delay([...db.products])
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return delay(db.products.find((p) => p.id === id))
}

export type NewProductInput = Omit<Product, 'id'>

export async function createProduct(input: NewProductInput): Promise<Product> {
  const product: Product = { id: nextId('prod'), ...input }
  db.products.unshift(product)
  return delay(product, 80)
}
