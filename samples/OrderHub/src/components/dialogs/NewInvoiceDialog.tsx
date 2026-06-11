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
  Option,
  Spinner,
  Text,
} from '@fluentui/react-components'
import { useCreateInvoice, useInvoiceableOrders } from '@/hooks/queries'
import { useNotify } from '@/lib/toast'
import { INVOICE_STATUSES, type InvoiceStatus } from '@/services/types'

interface NewInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewInvoiceDialog({ open, onOpenChange }: NewInvoiceDialogProps) {
  const createInvoice = useCreateInvoice()
  const ordersQuery = useInvoiceableOrders()
  const notify = useNotify()

  const [orderId, setOrderId] = useState('')
  const [status, setStatus] = useState<InvoiceStatus>('draft')

  const orders = ordersQuery.data ?? []
  const selectedOrder = orders.find((o) => o.id === orderId)

  async function submit() {
    const invoice = await createInvoice.mutateAsync({ orderId, status })
    notify('Invoice created', { body: invoice.invoiceNumber })
    setOrderId('')
    setStatus('draft')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>New invoice</DialogTitle>
          <DialogContent
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {orders.length === 0 ? (
              <Text>Every order already has an invoice.</Text>
            ) : (
              <>
                <Field label="Order" required>
                  <Dropdown
                    placeholder="Select an order"
                    value={
                      selectedOrder
                        ? `${selectedOrder.orderNumber} — ${selectedOrder.customerName}`
                        : ''
                    }
                    selectedOptions={orderId ? [orderId] : []}
                    onOptionSelect={(_, d) => setOrderId(d.optionValue ?? '')}
                  >
                    {orders.map((o) => (
                      <Option
                        key={o.id}
                        value={o.id}
                        text={`${o.orderNumber} — ${o.customerName}`}
                      >
                        {o.orderNumber} — {o.customerName}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
                <Field label="Status">
                  <Dropdown
                    value={status}
                    selectedOptions={[status]}
                    onOptionSelect={(_, d) =>
                      setStatus((d.optionValue as InvoiceStatus) ?? status)
                    }
                  >
                    {INVOICE_STATUSES.map((s) => (
                      <Option key={s} value={s}>
                        {s}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              disabled={!orderId || createInvoice.isPending}
              icon={createInvoice.isPending ? <Spinner size="tiny" /> : undefined}
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
