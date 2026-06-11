import { db, delay, nextId } from './db'
import {
  type Invoice,
  type InvoiceDetail,
  type InvoiceLineItemView,
  type Order,
} from './types'

export async function getInvoices(): Promise<Invoice[]> {
  return delay([...db.invoices])
}

export async function getInvoice(id: string): Promise<InvoiceDetail | undefined> {
  const invoice = db.invoices.find((inv) => inv.id === id)
  if (!invoice) return delay(undefined)

  const order = db.orders.find((o) => o.id === invoice.orderId)

  const lineItems: InvoiceLineItemView[] = db.invoiceLineItems
    .filter((li) => li.invoiceId === id)
    .map((li) => ({
      ...li,
      product: db.products.find((p) => p.id === li.productId),
    }))

  return delay({ ...invoice, order, lineItems })
}

// Orders that don't yet have an invoice — used to populate the "New invoice" form.
export async function getInvoiceableOrders(): Promise<Order[]> {
  const invoiced = new Set(db.invoices.map((inv) => inv.orderId))
  return delay(db.orders.filter((o) => !invoiced.has(o.id)))
}

export interface NewInvoiceInput {
  orderId: string
  status: Invoice['status']
}

export async function createInvoice(input: NewInvoiceInput): Promise<Invoice> {
  const order = db.orders.find((o) => o.id === input.orderId)
  const id = nextId('inv')
  const invoice: Invoice = {
    id,
    invoiceNumber: `INV-${id.replace('inv-', '')}`,
    orderId: input.orderId,
    status: input.status,
    issueDate: new Date().toISOString().slice(0, 10),
    amountDue: input.status === 'paid' ? 0 : (order?.total ?? 0),
  }
  db.invoices.unshift(invoice)

  // Mirror the order's line items onto the invoice.
  for (const oli of db.orderLineItems.filter((li) => li.orderId === input.orderId)) {
    db.invoiceLineItems.push({
      id: nextId('ili'),
      invoiceId: id,
      productId: oli.productId,
      quantity: oli.quantity,
      unitPrice: oli.unitPrice,
      lineTotal: oli.lineTotal,
    })
  }
  return delay(invoice, 80)
}

export async function markInvoicePaid(id: string): Promise<Invoice | undefined> {
  const invoice = db.invoices.find((inv) => inv.id === id)
  if (invoice) {
    invoice.status = 'paid'
    invoice.amountDue = 0
  }
  return delay(invoice ? { ...invoice } : undefined, 60)
}
