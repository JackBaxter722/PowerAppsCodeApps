import { useEffect, useState } from 'react'
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
import { useCreateProduct, useUpdateProduct } from '@/hooks/queries'
import { useNotify } from '@/lib/toast'
import { track } from '@/lib/telemetry'
import { type Product } from '@/services/types'

const CATEGORIES = ['Furniture', 'Electronics', 'Accessories', 'Lighting', 'Wellness']

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // When provided the dialog edits the product; otherwise it creates a new one.
  product?: Product
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const notify = useNotify()
  const isEdit = !!product

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [unitPrice, setUnitPrice] = useState('0')
  const [stock, setStock] = useState('0')

  // Seed the form whenever the dialog opens (for edit) or resets (for create).
  useEffect(() => {
    if (!open) return
    setName(product?.name ?? '')
    setSku(product?.sku ?? '')
    setCategory(product?.category ?? CATEGORIES[0])
    setUnitPrice(String(product?.unitPrice ?? 0))
    setStock(String(product?.stock ?? 0))
  }, [open, product])

  const pending = createProduct.isPending || updateProduct.isPending

  async function submit() {
    const values = {
      name: name.trim(),
      sku: sku.trim(),
      category,
      unitPrice: Number(unitPrice) || 0,
      stock: Number(stock) || 0,
    }
    if (isEdit) {
      await updateProduct.mutateAsync({ ...product, ...values })
      track('product_updated', { id: product.id })
      notify('Product updated', { body: values.name })
    } else {
      const created = await createProduct.mutateAsync(values)
      track('product_created', { id: created.id })
      notify('Product created', { body: created.name })
    }
    onOpenChange(false)
  }

  const valid = name.trim() && sku.trim()

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{isEdit ? 'Edit product' : 'New product'}</DialogTitle>
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
              disabled={!valid || pending}
              icon={pending ? <Spinner size="tiny" /> : undefined}
              onClick={submit}
            >
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
