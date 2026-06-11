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
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { PageHeader } from '@/components/PageHeader'
import { QueryState } from '@/components/QueryState'
import { useProducts } from '@/hooks/queries'
import { formatCurrency } from '@/lib/format'
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
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Catalog backed by a headless TanStack Table with sortable columns."
      />
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
