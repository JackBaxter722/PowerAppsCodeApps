import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import Layout from '@/pages/_layout'
import DashboardPage from '@/pages/dashboard'

// Lazy-load the heavier feature pages for code splitting.
const OrdersPage = lazy(() => import('@/pages/orders'))
const OrderDetailPage = lazy(() => import('@/pages/order-detail'))
const FulfillmentPage = lazy(() => import('@/pages/fulfillment'))
const ProductsPage = lazy(() => import('@/pages/products'))
const InvoicesPage = lazy(() => import('@/pages/invoices'))
const InvoiceDetailPage = lazy(() => import('@/pages/invoice-detail'))
const AssistantPage = lazy(() => import('@/pages/assistant'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

// IMPORTANT: Do not remove or modify the code below!
// Normalize basename when hosted in Power Apps
const BASENAME = new URL('.', location.href).pathname
if (location.pathname.endsWith('/index.html')) {
  history.replaceState(null, '', BASENAME + location.search + location.hash)
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      errorElement: <NotFoundPage />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'orders', element: <OrdersPage /> },
        { path: 'orders/:orderId', element: <OrderDetailPage /> },
        { path: 'fulfillment', element: <FulfillmentPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'invoices', element: <InvoicesPage /> },
        { path: 'invoices/:invoiceId', element: <InvoiceDetailPage /> },
        { path: 'assistant', element: <AssistantPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  {
    basename: BASENAME, // IMPORTANT: Set basename for proper routing when hosted in Power Apps
  },
)
