// TanStack Query hooks — the business-logic layer between pages and the mock
// services. Swapping the service imports for generated Dataverse services later
// would not change these hooks' signatures.

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { getDashboardMetrics } from '@/services/metricsService'
import {
  getOrder,
  getOrders,
  updateOrderStatus,
} from '@/services/ordersService'
import { getInvoice, getInvoices } from '@/services/invoicesService'
import { getProduct, getProducts } from '@/services/productsService'
import { type OrderStatus } from '@/services/types'

export const queryKeys = {
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  invoices: ['invoices'] as const,
  invoice: (id: string) => ['invoices', id] as const,
  metrics: ['metrics'] as const,
}

export function useOrders() {
  return useQuery({ queryKey: queryKeys.orders, queryFn: getOrders })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.order(id ?? ''),
    queryFn: () => getOrder(id as string),
    enabled: !!id,
  })
}

export function useProducts() {
  return useQuery({ queryKey: queryKeys.products, queryFn: getProducts })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.product(id ?? ''),
    queryFn: () => getProduct(id as string),
    enabled: !!id,
  })
}

export function useInvoices() {
  return useQuery({ queryKey: queryKeys.invoices, queryFn: getInvoices })
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.invoice(id ?? ''),
    queryFn: () => getInvoice(id as string),
    enabled: !!id,
  })
}

export function useDashboardMetrics() {
  return useQuery({ queryKey: queryKeys.metrics, queryFn: getDashboardMetrics })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      queryClient.invalidateQueries({ queryKey: queryKeys.metrics })
    },
  })
}
