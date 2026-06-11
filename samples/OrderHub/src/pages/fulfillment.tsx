import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  Caption1,
  Card,
  Dropdown,
  makeStyles,
  Option,
  Text,
  tokens,
  ToolbarButton,
  ToolbarDivider,
  ToolbarToggleButton,
} from '@fluentui/react-components'
import {
  ArrowClockwiseRegular,
  ArrowResetRegular,
  TextCollapseRegular,
} from '@fluentui/react-icons'
import { PageHeader } from '@/components/PageHeader'
import { PageToolbar } from '@/components/PageToolbar'
import { QueryState } from '@/components/QueryState'
import { useOrders, useUpdateOrderStatus } from '@/hooks/queries'
import { formatCurrency } from '@/lib/format'
import { type Order, type OrderStatus, ORDER_STATUSES } from '@/services/types'

const useStyles = makeStyles({
  board: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    overflowX: 'auto',
    paddingBottom: tokens.spacingVerticalM,
    alignItems: 'flex-start',
  },
  column: {
    flex: '0 0 240px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalS,
    minHeight: '120px',
  },
  columnOver: {
    outline: `2px dashed ${tokens.colorBrandStroke1}`,
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacingVerticalXS,
    textTransform: 'capitalize',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginTop: tokens.spacingVerticalS,
  },
  card: {
    padding: tokens.spacingVerticalS,
    cursor: 'grab',
  },
  cardDragging: {
    opacity: 0.4,
  },
})

function OrderCard({ order, compact }: { order: Order; compact: boolean }) {
  const styles = useStyles()
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: order.id })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      onDoubleClick={() => navigate(`/orders/${order.id}`)}
      {...listeners}
      {...attributes}
    >
      <Text weight="semibold">{order.orderNumber}</Text>
      <Caption1 block>{order.customerName}</Caption1>
      {!compact && <Caption1 block>{formatCurrency(order.total)}</Caption1>}
    </Card>
  )
}

function Column({
  status,
  orders,
  compact,
}: {
  status: OrderStatus
  orders: Order[]
  compact: boolean
}) {
  const styles = useStyles()
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`${styles.column} ${isOver ? styles.columnOver : ''}`}
    >
      <div className={styles.columnHeader}>
        <Text weight="semibold">{status}</Text>
        <Caption1>{orders.length}</Caption1>
      </div>
      <div className={styles.cardList}>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} compact={compact} />
        ))}
      </div>
    </div>
  )
}

export default function FulfillmentPage() {
  const styles = useStyles()
  const ordersQuery = useOrders()
  const updateStatus = useUpdateOrderStatus()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  // Optimistic local override so cards move instantly while the mutation runs.
  const [override, setOverride] = useState<Record<string, OrderStatus>>({})
  const [customer, setCustomer] = useState('')
  const [compact, setCompact] = useState(false)

  const customers = useMemo(
    () => [...new Set((ordersQuery.data ?? []).map((o) => o.customerName))].sort(),
    [ordersQuery.data],
  )

  const grouped = useMemo(() => {
    const map: Record<OrderStatus, Order[]> = {
      new: [],
      picking: [],
      packed: [],
      shipped: [],
      delivered: [],
    }
    for (const order of ordersQuery.data ?? []) {
      if (customer && order.customerName !== customer) continue
      const status = override[order.id] ?? order.status
      map[status].push({ ...order, status })
    }
    return map
  }, [ordersQuery.data, override, customer])

  function handleDragEnd(event: DragEndEvent) {
    const orderId = String(event.active.id)
    const target = event.over?.id as OrderStatus | undefined
    if (!target || !ORDER_STATUSES.includes(target)) return

    const current = override[orderId] ?? ordersQuery.data?.find((o) => o.id === orderId)?.status
    if (current === target) return

    setOverride((prev) => ({ ...prev, [orderId]: target }))
    updateStatus.mutate({ id: orderId, status: target })
  }

  return (
    <>
      <PageHeader
        title="Fulfillment board"
        subtitle="Drag orders between stages to update their status. Double-click a card to open it."
      />
      <PageToolbar
        ariaLabel="Fulfillment actions"
        checkedValues={{ density: compact ? ['compact'] : [] }}
        onCheckedValueChange={(_, { checkedItems }) =>
          setCompact(checkedItems.includes('compact'))
        }
      >
        <ToolbarButton
          icon={<ArrowClockwiseRegular />}
          onClick={() => ordersQuery.refetch()}
          disabled={ordersQuery.isFetching}
        >
          Refresh
        </ToolbarButton>
        <ToolbarButton
          icon={<ArrowResetRegular />}
          onClick={() => setOverride({})}
          disabled={Object.keys(override).length === 0}
        >
          Reset board
        </ToolbarButton>
        <ToolbarToggleButton
          name="density"
          value="compact"
          icon={<TextCollapseRegular />}
        >
          Compact
        </ToolbarToggleButton>
        <ToolbarDivider />
        <Dropdown
          placeholder="All customers"
          value={customer}
          selectedOptions={customer ? [customer] : []}
          onOptionSelect={(_, data) => setCustomer(data.optionValue ?? '')}
        >
          <Option value="">All customers</Option>
          {customers.map((c) => (
            <Option key={c} value={c}>
              {c}
            </Option>
          ))}
        </Dropdown>
      </PageToolbar>
      <QueryState
        isLoading={ordersQuery.isLoading}
        isError={ordersQuery.isError}
        data={ordersQuery.data}
        loadingLabel="Loading orders…"
      >
        {() => (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className={styles.board}>
              {ORDER_STATUSES.map((status) => (
                <Column
                  key={status}
                  status={status}
                  orders={grouped[status]}
                  compact={compact}
                />
              ))}
            </div>
          </DndContext>
        )}
      </QueryState>
    </>
  )
}
