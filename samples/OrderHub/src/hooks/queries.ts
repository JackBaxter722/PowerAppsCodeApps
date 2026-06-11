// TanStack Query hooks — the business-logic layer between pages and the mock
// services. Swapping the service imports for generated Dataverse services later
// would not change these hooks' signatures.

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  getDashboardMetrics,
  type MetricsRange,
} from '@/services/metricsService'
import {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
  type NewOrderInput,
} from '@/services/ordersService'
import {
  createInvoice,
  getInvoice,
  getInvoiceableOrders,
  getInvoices,
  markInvoicePaid,
  type NewInvoiceInput,
} from '@/services/invoicesService'
import {
  createProduct,
  getProduct,
  getProducts,
  type NewProductInput,
} from '@/services/productsService'
import { type OrderStatus } from '@/services/types'

export const queryKeys = {
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  invoices: ['invoices'] as const,
  invoiceableOrders: ['invoices', 'invoiceable'] as const,
  invoice: (id: string) => ['invoices', id] as const,
  metrics: (range: MetricsRange) => ['metrics', range] as const,
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

export function useInvoiceableOrders() {
  return useQuery({
    queryKey: queryKeys.invoiceableOrders,
    queryFn: getInvoiceableOrders,
  })
}

export function useDashboardMetrics(range: MetricsRange) {
  return useQuery({
    queryKey: queryKeys.metrics(range),
    queryFn: () => getDashboardMetrics(range),
  })
}

// All metrics variants share a stale source, so invalidate the whole family.
function invalidateMetrics(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['metrics'] })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      invalidateMetrics(queryClient)
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      invalidateMetrics(queryClient)
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewOrderInput) => createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoiceableOrders })
      invalidateMetrics(queryClient)
    },
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewInvoiceInput) => createInvoice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoiceableOrders })
      invalidateMetrics(queryClient)
    },
  })
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markInvoicePaid(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices })
      queryClient.invalidateQueries({ queryKey: queryKeys.invoice(id) })
      invalidateMetrics(queryClient)
    },
  })
}
