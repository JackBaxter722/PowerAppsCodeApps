// In-memory seed data backing the mock services.
//
// Data is generated deterministically so the app renders the same content on
// every load and the virtualized grids have enough rows to be meaningful. A
// single shared module owns the data so mutations (e.g. dragging an order to a
// new status on the fulfillment board) are visible across pages within a session.

import {
  type Invoice,
  type InvoiceLineItem,
  type InvoiceStatus,
  type Order,
  type OrderLineItem,
  type OrderStatus,
  type Product,
  ORDER_STATUSES,
} from './types'

const PRODUCT_NAMES = [
  'Aurora Desk Lamp',
  'Nimbus Office Chair',
  'Vertex Standing Desk',
  'Cobalt Mechanical Keyboard',
  'Halcyon Noise-Cancelling Headset',
  'Pulse 4K Monitor',
  'Drift Wireless Mouse',
  'Summit Laptop Stand',
  'Ember Desk Heater',
  'Glide Webcam Pro',
  'Quartz USB-C Hub',
  'Meridian Whiteboard',
  'Zephyr Air Purifier',
  'Lumen LED Panel',
  'Atlas Filing Cabinet',
  'Cascade Water Bottle',
]

const CATEGORIES = ['Furniture', 'Electronics', 'Accessories', 'Lighting', 'Wellness']

const CUSTOMERS = [
  'Contoso Ltd',
  'Fabrikam Inc',
  'Northwind Traders',
  'Adventure Works',
  'Tailspin Toys',
  'Wingtip Toys',
  'Litware Inc',
  'Proseware Inc',
  'Coho Vineyard',
  'Fourth Coffee',
]

// Small seeded pseudo-random generator for deterministic data.
function makeRng(seed: number) {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

interface Database {
  products: Product[]
  orders: Order[]
  orderLineItems: OrderLineItem[]
  invoices: Invoice[]
  invoiceLineItems: InvoiceLineItem[]
}

function seed(): Database {
  const rng = makeRng(42)

  const products: Product[] = PRODUCT_NAMES.map((name, i) => ({
    id: `prod-${i + 1}`,
    name,
    sku: `SKU-${String(i + 1).padStart(4, '0')}`,
    category: CATEGORIES[i % CATEGORIES.length],
    unitPrice: round2(20 + rng() * 480),
    stock: Math.floor(rng() * 500),
  }))

  const orders: Order[] = []
  const orderLineItems: OrderLineItem[] = []
  const invoices: Invoice[] = []
  const invoiceLineItems: InvoiceLineItem[] = []

  const invoiceStatuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue']
  const orderCount = 120

  for (let i = 0; i < orderCount; i++) {
    const orderId = `ord-${i + 1}`
    const status: OrderStatus = ORDER_STATUSES[Math.floor(rng() * ORDER_STATUSES.length)]
    const dayOffset = Math.floor(rng() * 180)
    const orderDate = new Date(2026, 0, 1)
    orderDate.setDate(orderDate.getDate() + dayOffset)

    const lineCount = 1 + Math.floor(rng() * 4)
    let orderTotal = 0
    const usedProducts = new Set<number>()

    for (let j = 0; j < lineCount; j++) {
      let pIndex = Math.floor(rng() * products.length)
      while (usedProducts.has(pIndex)) {
        pIndex = (pIndex + 1) % products.length
      }
      usedProducts.add(pIndex)

      const product = products[pIndex]
      const quantity = 1 + Math.floor(rng() * 8)
      const lineTotal = round2(product.unitPrice * quantity)
      orderTotal += lineTotal

      orderLineItems.push({
        id: `oli-${orderId}-${j + 1}`,
        orderId,
        productId: product.id,
        quantity,
        unitPrice: product.unitPrice,
        lineTotal,
      })
    }

    orderTotal = round2(orderTotal)

    orders.push({
      id: orderId,
      orderNumber: `SO-${String(1000 + i)}`,
      customerName: CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)],
      status,
      orderDate: orderDate.toISOString().slice(0, 10),
      total: orderTotal,
    })

    // Roughly 70% of orders have an invoice.
    if (rng() > 0.3) {
      const invoiceId = `inv-${i + 1}`
      const invStatus = invoiceStatuses[Math.floor(rng() * invoiceStatuses.length)]
      const issue = new Date(orderDate)
      issue.setDate(issue.getDate() + 2)

      invoices.push({
        id: invoiceId,
        invoiceNumber: `INV-${String(2000 + i)}`,
        orderId,
        status: invStatus,
        issueDate: issue.toISOString().slice(0, 10),
        amountDue: invStatus === 'paid' ? 0 : orderTotal,
      })

      // Invoice line items mirror the order's line items.
      for (const oli of orderLineItems.filter((li) => li.orderId === orderId)) {
        invoiceLineItems.push({
          id: `ili-${invoiceId}-${oli.id}`,
          invoiceId,
          productId: oli.productId,
          quantity: oli.quantity,
          unitPrice: oli.unitPrice,
          lineTotal: oli.lineTotal,
        })
      }
    }
  }

  return { products, orders, orderLineItems, invoices, invoiceLineItems }
}

export const db: Database = seed()

// Simulate network latency so TanStack Query loading states are exercised.
export function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
