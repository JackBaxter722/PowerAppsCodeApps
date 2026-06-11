import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import {
  Dropdown,
  Option,
  SearchBox,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  ToolbarButton,
  ToolbarDivider,
} from '@fluentui/react-components'
import {
  AddRegular,
  ArrowClockwiseRegular,
  ArrowExportRegular,
} from '@fluentui/react-icons'
import { NewProductDialog } from '@/components/dialogs/NewProductDialog'
import { PageHeader } from '@/components/PageHeader'
import { PageToolbar } from '@/components/PageToolbar'
import { QueryState } from '@/components/QueryState'
import { useProducts } from '@/hooks/queries'
import { exportCsv } from '@/lib/exportCsv'
import { formatCurrency } from '@/lib/format'
import { useNotify } from '@/lib/toast'
import { type Product } from '@/services/types'

const columnHelper = createColumnHelper<Product>()

const columns = [
  columnHelper.accessor('name', { header: 'Product' }),
  columnHelper.accessor('sku', { header: 'SKU' }),
  columnHelper.accessor('category', { header: 'Category' }),
  columnHelper.accessor('unitPrice', {
    header: 'Unit price',
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor('stock', { header: 'In stock' }),
]

function ProductsTable({ products }: { products: Product[] }) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Table aria-label="Products" sortable>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const sorted = header.column.getIsSorted()
              const sortDirection =
                sorted === 'asc'
                  ? 'ascending'
                  : sorted === 'desc'
                    ? 'descending'
                    : undefined
              return (
                <TableHeaderCell
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  sortDirection={sortDirection}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHeaderCell>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                <TableCellLayout>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCellLayout>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function ProductsPage() {
  const productsQuery = useProducts()
  const notify = useNotify()
  const [newOpen, setNewOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const all = useMemo(() => productsQuery.data ?? [], [productsQuery.data])

  const categories = useMemo(
    () => [...new Set(all.map((p) => p.category))].sort(),
    [all],
  )

  const products = useMemo(() => {
    const q = search.toLowerCase()
    return all.filter((p) => {
      if (category && p.category !== category) return false
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [all, search, category])

  function handleExport() {
    exportCsv('products', products, [
      { key: 'name', header: 'Product' },
      { key: 'sku', header: 'SKU' },
      { key: 'category', header: 'Category' },
      { key: 'unitPrice', header: 'Unit price' },
      { key: 'stock', header: 'In stock' },
    ])
    notify('Exported products', { body: `${products.length} row(s)` })
  }

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Catalog backed by a headless TanStack Table with sortable columns."
      />

      <PageToolbar ariaLabel="Products actions">
        <ToolbarButton
          appearance="primary"
          icon={<AddRegular />}
          onClick={() => setNewOpen(true)}
        >
          New product
        </ToolbarButton>
        <ToolbarButton
          icon={<ArrowClockwiseRegular />}
          onClick={() => productsQuery.refetch()}
          disabled={productsQuery.isFetching}
        >
          Refresh
        </ToolbarButton>
        <ToolbarButton icon={<ArrowExportRegular />} onClick={handleExport}>
          Export
        </ToolbarButton>
        <ToolbarDivider />
        <SearchBox
          placeholder="Name or SKU"
          value={search}
          onChange={(_, data) => setSearch(data.value)}
        />
        <Dropdown
          placeholder="All categories"
          value={category}
          selectedOptions={category ? [category] : []}
          onOptionSelect={(_, data) => setCategory(data.optionValue ?? '')}
        >
          <Option value="">All categories</Option>
          {categories.map((c) => (
            <Option key={c} value={c}>
              {c}
            </Option>
          ))}
        </Dropdown>
      </PageToolbar>

      <NewProductDialog open={newOpen} onOpenChange={setNewOpen} />

      <QueryState
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
        data={productsQuery.data}
        loadingLabel="Loading products…"
      >
        {() => <ProductsTable products={products} />}
      </QueryState>
    </>
  )
}
