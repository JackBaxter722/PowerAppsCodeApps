import { Badge } from '@fluentui/react-components'
import {
  type InvoiceStatus,
  type OrderStatus,
} from '@/services/types'

const ORDER_COLOR: Record<OrderStatus, 'informative' | 'warning' | 'brand' | 'success'> = {
  new: 'informative',
  picking: 'warning',
  packed: 'brand',
  shipped: 'brand',
  delivered: 'success',
}

const INVOICE_COLOR: Record<InvoiceStatus, 'subtle' | 'informative' | 'success' | 'danger'> = {
  draft: 'subtle',
  sent: 'informative',
  paid: 'success',
  overdue: 'danger',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge appearance="filled" color={ORDER_COLOR[status]}>
      {status}
    </Badge>
  )
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge appearance="filled" color={INVOICE_COLOR[status]}>
      {status}
    </Badge>
  )
}
