import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Caption1,
  Card,
  Dropdown,
  Option,
  Text,
  ToolbarButton,
  ToolbarDivider,
  ToolbarToggleButton,
  makeStyles,
  tokens,
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
import { track } from '@/lib/telemetry'
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
    minHeight: '24px',
  },
  card: {
    padding: tokens.spacingVerticalS,
    cursor: 'grab',
  },
  cardDragging: {
    opacity: 0.4,
  },
})

type Board = Record<OrderStatus, string[]>

function emptyBoard(): Board {
  return { new: [], picking: [], packed: [], shipped: [], delivered: [] }
}

function OrderCardContent({
  order,
  compact,
  className,
}: {
  order: Order
  compact: boolean
  className: string
}) {
  return (
    <Card className={className}>
      <Text weight="semibold">{order.orderNumber}</Text>
      <Caption1 block>{order.customerName}</Caption1>
      {!compact && <Caption1 block>{formatCurrency(order.total)}</Caption1>}
    </Card>
  )
}

function SortableCard({
  order,
  compact,
}: {
  order: Order
  compact: boolean
}) {
  const styles = useStyles()
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: order.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={() => navigate(`/orders/${order.id}`)}
      {...attributes}
      {...listeners}
    >
      <OrderCardContent
        order={order}
        compact={compact}
        className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}
      />
    </div>
  )
}

function Column({
  status,
  ids,
  ordersById,
  compact,
}: {
  status: OrderStatus
  ids: string[]
  ordersById: Map<string, Order>
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
        <Caption1>{ids.length}</Caption1>
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={styles.cardList}>
          {ids.map((id) => {
            const order = ordersById.get(id)
            return order ? (
              <SortableCard key={id} order={order} compact={compact} />
            ) : null
          })}
        </div>
      </SortableContext>
    </div>
  )
}

export default function FulfillmentPage() {
  const styles = useStyles()
  const ordersQuery = useOrders()
  const updateStatus = useUpdateOrderStatus()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const [board, setBoard] = useState<Board>(emptyBoard)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [customer, setCustomer] = useState('')
  const [compact, setCompact] = useState(false)

  const ordersById = useMemo(() => {
    const map = new Map<string, Order>()
    for (const o of ordersQuery.data ?? []) map.set(o.id, o)
    return map
  }, [ordersQuery.data])

  const customers = useMemo(
    () => [...new Set((ordersQuery.data ?? []).map((o) => o.customerName))].sort(),
    [ordersQuery.data],
  )

  // Seed the board from query data whenever the set of orders changes (load,
  // create, delete). Local reordering is preserved between those events.
  const idSignature = (ordersQuery.data ?? [])
    .map((o) => o.id)
    .sort()
    .join(',')
  useEffect(() => {
    const next = emptyBoard()
    for (const order of ordersQuery.data ?? []) {
      next[order.status].push(order.id)
    }
    setBoard(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSignature])

  function findColumn(id: string): OrderStatus | undefined {
    if (ORDER_STATUSES.includes(id as OrderStatus)) return id as OrderStatus
    return ORDER_STATUSES.find((status) => board[status].includes(id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const activeOrderId = String(event.active.id)
    if (!event.over) return

    const from = findColumn(activeOrderId)
    const to = findColumn(String(event.over.id))
    if (!from || !to) return

    if (from === to) {
      const oldIndex = board[from].indexOf(activeOrderId)
      const overIndex = board[to].indexOf(String(event.over.id))
      if (oldIndex !== overIndex && overIndex >= 0) {
        setBoard((prev) => ({
          ...prev,
          [from]: arrayMove(prev[from], oldIndex, overIndex),
        }))
      }
      return
    }

    // Cross-column move: relocate the card and persist the new status.
    setBoard((prev) => {
      const source = prev[from].filter((id) => id !== activeOrderId)
      const overId = String(event.over!.id)
      const target = [...prev[to]]
      const insertAt = target.indexOf(overId)
      target.splice(insertAt >= 0 ? insertAt : target.length, 0, activeOrderId)
      return { ...prev, [from]: source, [to]: target }
    })
    updateStatus.mutate({ id: activeOrderId, status: to })
    track('order_status_changed', { id: activeOrderId, status: to })
  }

  const activeOrder = activeId ? ordersById.get(activeId) : undefined

  function visibleIds(status: OrderStatus): string[] {
    if (!customer) return board[status]
    return board[status].filter((id) => ordersById.get(id)?.customerName === customer)
  }

  return (
    <>
      <PageHeader
        title="Fulfillment board"
        subtitle="Drag to reorder or move between stages. Keyboard: focus a card, Space, arrows, Space."
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
          onClick={() => {
            const next = emptyBoard()
            for (const order of ordersQuery.data ?? []) next[order.status].push(order.id)
            setBoard(next)
          }}
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
            onDragStart={(event: DragStartEvent) =>
              setActiveId(String(event.active.id))
            }
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <div className={styles.board}>
              {ORDER_STATUSES.map((status) => (
                <Column
                  key={status}
                  status={status}
                  ids={visibleIds(status)}
                  ordersById={ordersById}
                  compact={compact}
                />
              ))}
            </div>
            <DragOverlay>
              {activeOrder ? (
                <OrderCardContent
                  order={activeOrder}
                  compact={compact}
                  className={styles.card}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </QueryState>
    </>
  )
}
