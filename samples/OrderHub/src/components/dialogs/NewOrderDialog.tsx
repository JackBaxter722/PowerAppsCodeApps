import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  Input,
  Option,
  Spinner,
} from '@fluentui/react-components'
import { useCreateOrder, useProducts } from '@/hooks/queries'
import { useNotify } from '@/lib/toast'
import { ORDER_STATUSES, type OrderStatus } from '@/services/types'

interface NewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewOrderDialog({ open, onOpenChange }: NewOrderDialogProps) {
  const createOrder = useCreateOrder()
  const productsQuery = useProducts()
  const notify = useNotify()

  const [customerName, setCustomerName] = useState('')
  const [status, setStatus] = useState<OrderStatus>('new')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')

  const products = productsQuery.data ?? []
  const selectedProduct = products.find((p) => p.id === productId)

  function reset() {
    setCustomerName('')
    setStatus('new')
    setProductId('')
    setQuantity('1')
  }

  async function submit() {
    const order = await createOrder.mutateAsync({
      customerName: customerName.trim(),
      status,
      productId,
      quantity: Number(quantity) || 1,
    })
    notify('Order created', { body: order.orderNumber })
    reset()
    onOpenChange(false)
  }

  const valid = customerName.trim() && productId

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>New order</DialogTitle>
          <DialogContent
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <Field label="Customer" required>
              <Input
                value={customerName}
                onChange={(_, d) => setCustomerName(d.value)}
              />
            </Field>
            <Field label="Status">
              <Dropdown
                value={status}
                selectedOptions={[status]}
                onOptionSelect={(_, d) =>
                  setStatus((d.optionValue as OrderStatus) ?? status)
                }
              >
                {ORDER_STATUSES.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <Field label="Product" required>
              <Dropdown
                placeholder="Select a product"
                value={selectedProduct?.name ?? ''}
                selectedOptions={productId ? [productId] : []}
                onOptionSelect={(_, d) => setProductId(d.optionValue ?? '')}
              >
                {products.map((p) => (
                  <Option key={p.id} value={p.id} text={p.name}>
                    {p.name}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <Field label="Quantity">
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(_, d) => setQuantity(d.value)}
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              disabled={!valid || createOrder.isPending}
              icon={createOrder.isPending ? <Spinner size="tiny" /> : undefined}
              onClick={submit}
            >
              Create
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
