import { db, delay } from './db'
import {
  type Invoice,
  type InvoiceDetail,
  type InvoiceLineItemView,
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
