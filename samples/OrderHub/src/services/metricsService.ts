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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const totalRevenue = Math.round(db.orders.reduce((sum, o) => sum + o.total, 0))

  const openOrders = db.orders.filter(
    (o) => o.status !== 'delivered',
  ).length

  const overdueInvoices = db.invoices.filter((i) => i.status === 'overdue').length

  const ordersByStatus = ORDER_STATUSES.map((status) => ({
    status,
    count: db.orders.filter((o) => o.status === status).length,
  }))

  // Revenue aggregated by month from order dates.
  const byMonth = new Map<string, number>()
  for (const order of db.orders) {
    const month = order.orderDate.slice(0, 7) // YYYY-MM
    byMonth.set(month, (byMonth.get(month) ?? 0) + order.total)
  }
  const revenueByMonth = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }))

  // Top products by revenue across all order line items.
  const productRevenue = new Map<string, number>()
  for (const li of db.orderLineItems) {
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
