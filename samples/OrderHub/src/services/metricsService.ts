import { db, delay } from './db'
import { type OrderStatus, ORDER_STATUSES } from './types'

export interface DashboardMetrics {
  totalRevenue: number
  openOrders: number
  overdueInvoices: number
  productCount: number
  ordersByStatus: { status: OrderStatus; count: number }[]
  revenueByMonth: { month: string; revenue: number }[]
  topProducts: { name: string; revenue: number }[]
}

export type MetricsRange = '30d' | '90d' | 'all'

function withinRange(orderDate: string, range: MetricsRange): boolean {
  if (range === 'all') return true
  const days = range === '30d' ? 30 : 90
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return new Date(orderDate).getTime() >= cutoff
}

export async function getDashboardMetrics(
  range: MetricsRange = 'all',
): Promise<DashboardMetrics> {
  const orders = db.orders.filter((o) => withinRange(o.orderDate, range))

  const totalRevenue = Math.round(orders.reduce((sum, o) => sum + o.total, 0))

  const openOrders = orders.filter((o) => o.status !== 'delivered').length

  const overdueInvoices = db.invoices.filter((i) => i.status === 'overdue').length

  const ordersByStatus = ORDER_STATUSES.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }))

  // Revenue aggregated by month from order dates.
  const byMonth = new Map<string, number>()
  for (const order of orders) {
    const month = order.orderDate.slice(0, 7) // YYYY-MM
    byMonth.set(month, (byMonth.get(month) ?? 0) + order.total)
  }
  const revenueByMonth = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }))

  // Top products by revenue across the in-range orders' line items.
  const orderIds = new Set(orders.map((o) => o.id))
  const productRevenue = new Map<string, number>()
  for (const li of db.orderLineItems) {
    if (!orderIds.has(li.orderId)) continue
    productRevenue.set(
      li.productId,
      (productRevenue.get(li.productId) ?? 0) + li.lineTotal,
    )
  }
  const topProducts = [...productRevenue.entries()]
    .map(([productId, revenue]) => ({
      name: db.products.find((p) => p.id === productId)?.name ?? productId,
      revenue: Math.round(revenue),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)

  return delay({
    totalRevenue,
    openOrders,
    overdueInvoices,
    productCount: db.products.length,
    ordersByStatus,
    revenueByMonth,
    topProducts,
  })
}
