import { describe, expect, it } from 'vitest'
import { parseDeepLink } from './parseDeepLink'

function target(params: Record<string, string>) {
  const result = parseDeepLink(params)
  return result ? result.path + result.search : null
}

describe('parseDeepLink', () => {
  it('routes entity + id to the record', () => {
    expect(target({ entity: 'order', id: 'ord-12' })).toBe('/orders/ord-12')
    expect(target({ entity: 'invoice', id: 'inv-3' })).toBe('/invoices/inv-3')
    expect(target({ entity: 'product', id: 'prod-2' })).toBe('/products/prod-2')
  })

  it('supports plural and synonym entity aliases', () => {
    expect(target({ entity: 'orders', id: 'ord-1' })).toBe('/orders/ord-1')
    expect(target({ entity: 'bill', id: 'inv-1' })).toBe('/invoices/inv-1')
    expect(target({ entity: 'item', id: 'prod-1' })).toBe('/products/prod-1')
  })

  it('routes dedicated id-bearing params', () => {
    expect(target({ orderId: 'ord-9' })).toBe('/orders/ord-9')
    expect(target({ invoiceId: 'inv-9' })).toBe('/invoices/inv-9')
    expect(target({ productId: 'prod-9' })).toBe('/products/prod-9')
  })

  it('is case-insensitive on keys and entity values', () => {
    expect(target({ Entity: 'Invoice', ID: 'inv-7' })).toBe('/invoices/inv-7')
    expect(target({ View: 'Fulfillment' })).toBe('/fulfillment')
  })

  it('routes named views', () => {
    expect(target({ view: 'dashboard' })).toBe('/')
    expect(target({ view: 'fulfillment' })).toBe('/fulfillment')
    expect(target({ view: 'board' })).toBe('/fulfillment')
    expect(target({ page: 'invoices' })).toBe('/invoices')
  })

  it('forwards filters onto the destination route', () => {
    expect(target({ view: 'orders', status: 'overdue' })).toBe(
      '/orders?status=overdue',
    )
    expect(target({ entity: 'order' })).toContain('/orders')
  })

  it('defaults to orders when only filters are supplied', () => {
    const result = parseDeepLink({ status: 'open', customer: 'Contoso' })
    expect(result?.path).toBe('/orders')
    expect(result?.search).toContain('status=open')
    expect(result?.search).toContain('customer=Contoso')
  })

  it('normalises filter aliases (customerId -> customer, search -> q)', () => {
    expect(target({ customerId: 'Fabrikam' })).toBe('/orders?customer=Fabrikam')
    expect(target({ search: 'SO-1005' })).toBe('/orders?q=SO-1005')
  })

  it('returns null for empty or unrecognised input', () => {
    expect(parseDeepLink({})).toBeNull()
    expect(parseDeepLink(null)).toBeNull()
    expect(parseDeepLink({ nonsense: 'x' })).toBeNull()
  })
})
