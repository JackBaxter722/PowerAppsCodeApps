import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Combobox,
  Option,
  makeStyles,
  Text,
  tokens,
  type ComboboxProps,
} from '@fluentui/react-components'
import {
  BoxRegular,
  DocumentRegular,
  ReceiptRegular,
} from '@fluentui/react-icons'
import { useInvoices, useOrders, useProducts } from '@/hooks/queries'

const useStyles = makeStyles({
  combobox: {
    minWidth: '280px',
  },
  optionMeta: {
    color: tokens.colorNeutralForeground3,
    marginLeft: tokens.spacingHorizontalS,
  },
})

interface SearchEntry {
  key: string
  to: string
  primary: string
  secondary: string
  kind: 'order' | 'invoice' | 'product'
}

const ICONS = {
  order: BoxRegular,
  invoice: ReceiptRegular,
  product: DocumentRegular,
}

// A typeahead SearchBox (Fluent Combobox) that searches across orders,
// invoices, and products and navigates to the chosen record.
export function GlobalSearch() {
  const styles = useStyles()
  const navigate = useNavigate()
  const orders = useOrders()
  const invoices = useInvoices()
  const products = useProducts()
  const [query, setQuery] = useState('')

  const entries = useMemo<SearchEntry[]>(() => {
    const result: SearchEntry[] = []
    for (const o of orders.data ?? []) {
      result.push({
        key: o.id,
        to: `/orders/${o.id}`,
        primary: o.orderNumber,
        secondary: o.customerName,
        kind: 'order',
      })
    }
    for (const inv of invoices.data ?? []) {
      result.push({
        key: inv.id,
        to: `/invoices/${inv.id}`,
        primary: inv.invoiceNumber,
        secondary: inv.status,
        kind: 'invoice',
      })
    }
    for (const p of products.data ?? []) {
      result.push({
        key: p.id,
        to: `/products`,
        primary: p.name,
        secondary: p.sku,
        kind: 'product',
      })
    }
    return result
  }, [orders.data, invoices.data, products.data])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return entries
      .filter(
        (e) =>
          e.primary.toLowerCase().includes(q) ||
          e.secondary.toLowerCase().includes(q),
      )
      .slice(0, 8)
  }, [entries, query])

  const onOptionSelect: ComboboxProps['onOptionSelect'] = (_, data) => {
    if (data.optionValue) {
      navigate(data.optionValue)
      setQuery('')
    }
  }

  return (
    <Combobox
      className={styles.combobox}
      placeholder="Search orders, invoices, products…"
      freeform
      clearable
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onOptionSelect={onOptionSelect}
      aria-label="Global search"
    >
      {matches.map((entry) => {
        const Icon = ICONS[entry.kind]
        return (
          <Option
            key={`${entry.kind}-${entry.key}`}
            value={entry.to}
            text={entry.primary}
          >
            <Icon />
            <Text>{entry.primary}</Text>
            <Text size={200} className={styles.optionMeta}>
              {entry.secondary}
            </Text>
          </Option>
        )
      })}
      {query.trim() && matches.length === 0 && (
        <Option value="" disabled text="No results">
          No results
        </Option>
      )}
    </Combobox>
  )
}
