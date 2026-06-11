// Domain types for OrderHub.
//
// These mirror the shape of the planned Dataverse tables (orders, order line
// items, products, invoices, invoice line items). They are intentionally simple
// so the in-memory mock services below can later be swapped for generated
// Dataverse services (see samples/Dataverse/src/generated/services) with minimal
// changes to the hooks that consume them.

export type OrderStatus = 'new' | 'picking' | 'packed' | 'shipped' | 'delivered'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  unitPrice: number
  stock: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  status: OrderStatus
  orderDate: string // ISO date
  total: number
}

export interface OrderLineItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  orderId: string
  status: InvoiceStatus
  issueDate: string // ISO date
  amountDue: number
}

export interface InvoiceLineItem {
  id: string
  invoiceId: string
  productId: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

// Composite read models used by detail pages.
export interface OrderLineItemView extends OrderLineItem {
  product: Product | undefined
}

export interface OrderDetail extends Order {
  lineItems: OrderLineItemView[]
  invoice: Invoice | undefined
}

export interface InvoiceLineItemView extends InvoiceLineItem {
  product: Product | undefined
}

export interface InvoiceDetail extends Invoice {
  order: Order | undefined
  lineItems: InvoiceLineItemView[]
}

export const ORDER_STATUSES: OrderStatus[] = [
  'new',
  'picking',
  'packed',
  'shipped',
  'delivered',
]

export const INVOICE_STATUSES: InvoiceStatus[] = [
  'draft',
  'sent',
  'paid',
  'overdue',
]
