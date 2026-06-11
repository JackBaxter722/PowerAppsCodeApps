import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SearchBox,
  Text,
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from '@fluentui/react-components'
import {
  BoxRegular,
  DocumentRegular,
  ReceiptRegular,
} from '@fluentui/react-icons'
import { useInvoices, useOrders, useProducts } from '@/hooks/queries'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    minWidth: '300px',
  },
  listbox: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow16,
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
    maxHeight: '320px',
    overflowY: 'auto',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalSNudge,
    paddingBottom: tokens.spacingVerticalSNudge,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    cursor: 'pointer',
  },
  optionActive: {
    backgroundColor: tokens.colorNeutralBackground1Hover,
  },
  meta: {
    color: tokens.colorNeutralForeground3,
    marginLeft: 'auto',
  },
  empty: {
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground3,
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

const LISTBOX_ID = 'global-search-listbox'

// A Fluent SearchBox with a typeahead suggestion list that searches across
// orders, invoices, and products and navigates to the chosen record.
export function GlobalSearch() {
  const styles = useStyles()
  const navigate = useNavigate()
  const orders = useOrders()
  const invoices = useInvoices()
  const products = useProducts()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const blurTimer = useRef<number>()

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
        to: `/products?q=${encodeURIComponent(p.name)}`,
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

  const showList = open && query.trim().length > 0

  function select(entry: SearchEntry) {
    navigate(entry.to)
    setQuery('')
    setOpen(false)
  }

  function onChange(value: string) {
    setQuery(value)
    setOpen(true)
    setActiveIndex(0)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!showList && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true)
      return
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, matches.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        if (showList && matches[activeIndex]) {
          event.preventDefault()
          select(matches[activeIndex])
        }
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  return (
    <div className={styles.root}>
      <SearchBox
        placeholder="Search orders, invoices, products…"
        value={query}
        onChange={(_, data) => onChange(data.value)}
        onFocus={() => query && setOpen(true)}
        onBlur={() => {
          // Delay so a click on an option registers before the list closes.
          blurTimer.current = window.setTimeout(() => setOpen(false), 150)
        }}
        onKeyDown={onKeyDown}
        input={{
          role: 'combobox',
          'aria-expanded': showList,
          'aria-controls': LISTBOX_ID,
          'aria-autocomplete': 'list',
          'aria-activedescendant': showList
            ? `gs-opt-${activeIndex}`
            : undefined,
        }}
        aria-label="Global search"
      />

      {showList && (
        <div id={LISTBOX_ID} role="listbox" className={styles.listbox}>
          {matches.length === 0 ? (
            <Text className={styles.empty}>No results</Text>
          ) : (
            matches.map((entry, index) => {
              const Icon = ICONS[entry.kind]
              return (
                <div
                  key={`${entry.kind}-${entry.key}`}
                  id={`gs-opt-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={mergeClasses(
                    styles.option,
                    index === activeIndex && styles.optionActive,
                  )}
                  onMouseDown={(e) => {
                    // Prevent the SearchBox from losing focus before the click.
                    e.preventDefault()
                    clearTimeout(blurTimer.current)
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(entry)}
                >
                  <Icon />
                  <Text>{entry.primary}</Text>
                  <Text size={200} className={styles.meta}>
                    {entry.secondary}
                  </Text>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
