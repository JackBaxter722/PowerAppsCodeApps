import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  createTableColumn,
  Dropdown,
  makeStyles,
  Option,
  SearchBox,
  ToolbarButton,
  ToolbarDivider,
  type TableColumnDefinition,
} from '@fluentui/react-components'
import {
  AddRegular,
  ArrowClockwiseRegular,
  ArrowExportRegular,
  DismissRegular,
} from '@fluentui/react-icons'
import { AppLink } from '@/components/AppLink'
import {
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
} from '@fluentui-contrib/react-data-grid-react-window'
import { NewOrderDialog } from '@/components/dialogs/NewOrderDialog'
import { PageHeader } from '@/components/PageHeader'
import { PageToolbar } from '@/components/PageToolbar'
import { QueryState } from '@/components/QueryState'
import { TableSkeleton } from '@/components/skeletons'
import { OrderStatusBadge } from '@/components/StatusBadge'
import { useOrders } from '@/hooks/queries'
import { exportCsv } from '@/lib/exportCsv'
import { formatCurrency, formatDate } from '@/lib/format'
import { useNotify } from '@/lib/toast'
import { type Order, ORDER_STATUSES } from '@/services/types'

const useStyles = makeStyles({
  grid: {
    minWidth: '760px',
  },
})

const columns: TableColumnDefinition<Order>[] = [
  createTableColumn<Order>({
    columnId: 'orderNumber',
    compare: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
    renderHeaderCell: () => 'Order',
    renderCell: (order) => (
      <AppLink to={`/orders/${order.id}`}>{order.orderNumber}</AppLink>
    ),
  }),
  createTableColumn<Order>({
    columnId: 'customerName',
    compare: (a, b) => a.customerName.localeCompare(b.customerName),
    renderHeaderCell: () => 'Customer',
    renderCell: (order) => order.customerName,
  }),
  createTableColumn<Order>({
    columnId: 'status',
    compare: (a, b) => a.status.localeCompare(b.status),
    renderHeaderCell: () => 'Status',
    renderCell: (order) => <OrderStatusBadge status={order.status} />,
  }),
  createTableColumn<Order>({
    columnId: 'orderDate',
    compare: (a, b) => a.orderDate.localeCompare(b.orderDate),
    renderHeaderCell: () => 'Order date',
    renderCell: (order) => formatDate(order.orderDate),
  }),
  createTableColumn<Order>({
    columnId: 'total',
    compare: (a, b) => a.total - b.total,
    renderHeaderCell: () => 'Total',
    renderCell: (order) => formatCurrency(order.total),
  }),
]

export default function OrdersPage() {
  const styles = useStyles()
  const ordersQuery = useOrders()
  const notify = useNotify()
  const [newOpen, setNewOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const statusFilter = searchParams.get('status') ?? ''
  const customerFilter = searchParams.get('customer') ?? ''
  const queryFilter = searchParams.get('q') ?? ''

  function setParam(key: string, value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  const filtered = useMemo(() => {
    const all = ordersQuery.data ?? []
    const q = queryFilter.toLowerCase()
    const customer = customerFilter.toLowerCase()
    return all.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false
      if (customer && !o.customerName.toLowerCase().includes(customer)) return false
      if (
        q &&
        !o.orderNumber.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [ordersQuery.data, statusFilter, customerFilter, queryFilter])

  const hasFilters = !!(statusFilter || customerFilter || queryFilter)

  function handleExport() {
    exportCsv('orders', filtered, [
      { key: 'orderNumber', header: 'Order' },
      { key: 'customerName', header: 'Customer' },
      { key: 'status', header: 'Status' },
      { key: 'orderDate', header: 'Order date' },
      { key: 'total', header: 'Total' },
    ])
    notify('Exported orders', { body: `${filtered.length} row(s)` })
  }

  function clearFilters() {
    setSearchParams({}, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${filtered.length} order(s). Columns are sortable; the grid is virtualized.`}
      />

      <PageToolbar ariaLabel="Orders actions">
        <ToolbarButton
          appearance="primary"
          icon={<AddRegular />}
          onClick={() => setNewOpen(true)}
        >
          New order
        </ToolbarButton>
        <ToolbarButton
          icon={<ArrowClockwiseRegular />}
          onClick={() => ordersQuery.refetch()}
          disabled={ordersQuery.isFetching}
        >
          Refresh
        </ToolbarButton>
        <ToolbarButton icon={<ArrowExportRegular />} onClick={handleExport}>
          Export
        </ToolbarButton>
        <ToolbarDivider />
        <SearchBox
          placeholder="Order # or customer"
          value={queryFilter}
          onChange={(_, data) => setParam('q', data.value)}
        />
        <Dropdown
          placeholder="All statuses"
          value={statusFilter}
          selectedOptions={statusFilter ? [statusFilter] : []}
          onOptionSelect={(_, data) => setParam('status', data.optionValue ?? '')}
        >
          <Option value="">All statuses</Option>
          {ORDER_STATUSES.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Dropdown>
        {hasFilters && (
          <ToolbarButton icon={<DismissRegular />} onClick={clearFilters}>
            Clear
          </ToolbarButton>
        )}
      </PageToolbar>

      <NewOrderDialog open={newOpen} onOpenChange={setNewOpen} />

      <QueryState
        isLoading={ordersQuery.isLoading}
        isError={ordersQuery.isError}
        data={ordersQuery.data}
        skeleton={<TableSkeleton />}
      >
        {() => (
          <DataGrid
            items={filtered}
            columns={columns}
            sortable
            getRowId={(order) => order.id}
            className={styles.grid}
          >
            <DataGridHeader>
              <DataGridRow>
                {({ renderHeaderCell }) => (
                  <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody<Order> itemSize={44} height={480}>
              {({ item, rowId }, style) => (
                <DataGridRow<Order> key={rowId} style={style}>
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        )}
      </QueryState>
    </>
  )
}
