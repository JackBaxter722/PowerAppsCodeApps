import { db, delay, nextId } from './db'
import {
  type Order,
  type OrderDetail,
  type OrderLineItemView,
  type OrderStatus,
} from './types'

export async function getOrders(): Promise<Order[]> {
  return delay([...db.orders])
}

export async function getOrder(id: string): Promise<OrderDetail | undefined> {
  const order = db.orders.find((o) => o.id === id)
  if (!order) return delay(undefined)

  const lineItems: OrderLineItemView[] = db.orderLineItems
    .filter((li) => li.orderId === id)
    .map((li) => ({
      ...li,
      product: db.products.find((p) => p.id === li.productId),
    }))

  const invoice = db.invoices.find((inv) => inv.orderId === id)

  return delay({ ...order, lineItems, invoice })
}

export interface NewOrderInput {
  customerName: string
  status: OrderStatus
  productId: string
  quantity: number
}

export async function createOrder(input: NewOrderInput): Promise<Order> {
  const product = db.products.find((p) => p.id === input.productId)
  const unitPrice = product?.unitPrice ?? 0
  const lineTotal = Math.round(unitPrice * input.quantity * 100) / 100
  const id = nextId('ord')

  const order: Order = {
    id,
    orderNumber: `SO-${id.replace('ord-', '')}`,
    customerName: input.customerName,
    status: input.status,
    orderDate: new Date().toISOString().slice(0, 10),
    total: lineTotal,
  }
  db.orders.unshift(order)
  db.orderLineItems.push({
    id: nextId('oli'),
    orderId: id,
    productId: input.productId,
    quantity: input.quantity,
    unitPrice,
    lineTotal,
  })
  return delay(order, 80)
}

// Mutates shared in-memory state so the change is reflected on other pages
// within the session (used by the fulfillment board drag-and-drop).
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | undefined> {
  const order = db.orders.find((o) => o.id === id)
  if (order) {
    order.status = status
  }
  return delay(order ? { ...order } : undefined, 50)
}
