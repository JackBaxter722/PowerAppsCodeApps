import { db, delay } from './db'
import { type Product } from './types'

export async function getProducts(): Promise<Product[]> {
  return delay([...db.products])
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return delay(db.products.find((p) => p.id === id))
}
