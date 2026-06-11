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
import { useCreateProduct } from '@/hooks/queries'
import { useNotify } from '@/lib/toast'

const CATEGORIES = ['Furniture', 'Electronics', 'Accessories', 'Lighting', 'Wellness']

interface NewProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewProductDialog({ open, onOpenChange }: NewProductDialogProps) {
  const createProduct = useCreateProduct()
  const notify = useNotify()
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [unitPrice, setUnitPrice] = useState('0')
  const [stock, setStock] = useState('0')

  function reset() {
    setName('')
    setSku('')
    setCategory(CATEGORIES[0])
    setUnitPrice('0')
    setStock('0')
  }

  async function submit() {
    const product = await createProduct.mutateAsync({
      name: name.trim(),
      sku: sku.trim(),
      category,
      unitPrice: Number(unitPrice) || 0,
      stock: Number(stock) || 0,
    })
    notify('Product created', { body: product.name })
    reset()
    onOpenChange(false)
  }

  const valid = name.trim() && sku.trim()

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>New product</DialogTitle>
          <DialogContent
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <Field label="Name" required>
              <Input value={name} onChange={(_, d) => setName(d.value)} />
            </Field>
            <Field label="SKU" required>
              <Input value={sku} onChange={(_, d) => setSku(d.value)} />
            </Field>
            <Field label="Category">
              <Dropdown
                value={category}
                selectedOptions={[category]}
                onOptionSelect={(_, d) => setCategory(d.optionValue ?? category)}
              >
                {CATEGORIES.map((c) => (
                  <Option key={c} value={c}>
                    {c}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <Field label="Unit price">
              <Input
                type="number"
                value={unitPrice}
                onChange={(_, d) => setUnitPrice(d.value)}
              />
            </Field>
            <Field label="Stock">
              <Input
                type="number"
                value={stock}
                onChange={(_, d) => setStock(d.value)}
              />
            </Field>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              disabled={!valid || createProduct.isPending}
              icon={createProduct.isPending ? <Spinner size="tiny" /> : undefined}
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
