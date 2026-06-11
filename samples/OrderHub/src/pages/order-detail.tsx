import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useResizeHandle } from '@fluentui-contrib/react-resize-handle'
import {
  Card,
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  mergeClasses,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  tokens,
  ToolbarButton,
  ToolbarDivider,
} from '@fluentui/react-components'
import {
  ArrowLeftRegular,
  ArrowSortRegular,
  DeleteRegular,
  PrintRegular,
  ReceiptRegular,
} from '@fluentui/react-icons'
import { AppLink } from '@/components/AppLink'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { PageHeader } from '@/components/PageHeader'
import { PageToolbar } from '@/components/PageToolbar'
import { QueryState } from '@/components/QueryState'
import { OrderStatusBadge } from '@/components/StatusBadge'
import { useDeleteOrder, useOrder, useUpdateOrderStatus } from '@/hooks/queries'
import { formatCurrency, formatDate } from '@/lib/format'
import { track } from '@/lib/telemetry'
import { useNotify } from '@/lib/toast'
import { ORDER_STATUSES, type OrderStatus } from '@/services/types'

const useStyles = makeStyles({
  splitWrapper: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
    gap: 0,
  },
  master: {
    width: `clamp(240px, var(--master-width, 320px), 640px)`,
    flexShrink: 0,
    overflow: 'hidden',
  },
  masterCard: {
    padding: tokens.spacingVerticalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  handle: {
    flexShrink: 0,
    width: '10px',
    cursor: 'col-resize',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  handleBar: {
    width: '2px',
    height: '40px',
    backgroundColor: tokens.colorNeutralStroke1,
    borderRadius: tokens.borderRadiusSmall,
  },
  detail: {
    flexGrow: 1,
    minWidth: '280px',
    paddingLeft: tokens.spacingHorizontalL,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
})

export default function OrderDetailPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const notify = useNotify()
  const { orderId } = useParams()
  const orderQuery = useOrder(orderId)
  const updateStatus = useUpdateOrderStatus()
  const deleteOrder = useDeleteOrder()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function changeStatus(status: OrderStatus) {
    if (!orderId) return
    updateStatus.mutate(
      { id: orderId, status },
      { onSuccess: () => notify('Order status updated', { body: status }) },
    )
  }

  function handleDelete() {
    if (!orderId) return
    deleteOrder.mutate(orderId, {
      onSuccess: () => {
        track('order_deleted', { id: orderId })
        notify('Order deleted')
        navigate('/orders')
      },
    })
  }

  // Resizable master/detail split powered by @fluentui-contrib/react-resize-handle.
  const { handleRef, wrapperRef, elementRef } = useResizeHandle({
    growDirection: 'end',
    variableName: '--master-width',
    minValue: 240,
    maxValue: 640,
    unit: 'px',
  })

  return (
    <>
      <PageHeader
        title="Order"
        subtitle="Drag the divider to resize the summary panel."
      />
      <QueryState
        isLoading={orderQuery.isLoading}
        isError={orderQuery.isError}
        data={orderQuery.data}
        loadingLabel="Loading order…"
        emptyLabel="Order not found."
      >
        {(order) => (
          <>
          <Breadcrumbs
            items={[
              { label: 'Orders', to: '/orders' },
              { label: order.orderNumber },
            ]}
          />
          <PageToolbar ariaLabel="Order actions">
            <ToolbarButton
              icon={<ArrowLeftRegular />}
              onClick={() => navigate('/orders')}
            >
              Back
            </ToolbarButton>
            <ToolbarDivider />
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <ToolbarButton
                  icon={<ArrowSortRegular />}
                  disabled={updateStatus.isPending}
                >
                  Set status
                </ToolbarButton>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {ORDER_STATUSES.map((status) => (
                    <MenuItem
                      key={status}
                      disabled={status === order.status}
                      onClick={() => changeStatus(status)}
                    >
                      {status}
                    </MenuItem>
                  ))}
                </MenuList>
              </MenuPopover>
            </Menu>
            {order.invoice && (
              <ToolbarButton
                icon={<ReceiptRegular />}
                onClick={() => navigate(`/invoices/${order.invoice!.id}`)}
              >
                View invoice
              </ToolbarButton>
            )}
            <ToolbarButton
              icon={<PrintRegular />}
              onClick={() => window.print()}
            >
              Print
            </ToolbarButton>
            <ToolbarButton
              icon={<DeleteRegular />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </ToolbarButton>
          </PageToolbar>

          <ConfirmDialog
            open={confirmDelete}
            onOpenChange={setConfirmDelete}
            title="Delete order"
            message={`Delete ${order.orderNumber}? This cannot be undone.`}
            onConfirm={handleDelete}
          />

          <div ref={wrapperRef} className={styles.splitWrapper}>
            <div ref={elementRef} className={styles.master}>
              <Card className={styles.masterCard}>
                <div className={styles.field}>
                  <Text size={200}>Order number</Text>
                  <Text weight="semibold" size={500}>
                    {order.orderNumber}
                  </Text>
                </div>
                <div className={styles.field}>
                  <Text size={200}>Customer</Text>
                  <Text weight="semibold">{order.customerName}</Text>
                </div>
                <div className={styles.field}>
                  <Text size={200}>Status</Text>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className={styles.field}>
                  <Text size={200}>Order date</Text>
                  <Text weight="semibold">{formatDate(order.orderDate)}</Text>
                </div>
                <div className={styles.field}>
                  <Text size={200}>Total</Text>
                  <Text weight="semibold">{formatCurrency(order.total)}</Text>
                </div>
                <div className={styles.field}>
                  <Text size={200}>Invoice</Text>
                  {order.invoice ? (
                    <AppLink to={`/invoices/${order.invoice.id}`}>
                      {order.invoice.invoiceNumber}
                    </AppLink>
                  ) : (
                    <Text>No invoice yet</Text>
                  )}
                </div>
              </Card>
            </div>

            <div ref={handleRef} className={styles.handle}>
              <div className={mergeClasses(styles.handleBar)} />
            </div>

            <div className={styles.detail}>
              <Text as="h2" size={500} weight="semibold" block>
                Line items
              </Text>
              <Table aria-label="Order line items">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Product</TableHeaderCell>
                    <TableHeaderCell>Quantity</TableHeaderCell>
                    <TableHeaderCell>Unit price</TableHeaderCell>
                    <TableHeaderCell>Line total</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.lineItems.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.product?.name ?? line.productId}</TableCell>
                      <TableCell>{line.quantity}</TableCell>
                      <TableCell>{formatCurrency(line.unitPrice)}</TableCell>
                      <TableCell>{formatCurrency(line.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          </>
        )}
      </QueryState>
    </>
  )
}
