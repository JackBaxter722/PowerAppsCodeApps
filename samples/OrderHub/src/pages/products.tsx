import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  Button,
  Checkbox,
  Dropdown,
  Menu,
  MenuItemCheckbox,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Option,
  SearchBox,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  ToolbarButton,
  ToolbarDivider,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import {
  AddRegular,
  ArrowClockwiseRegular,
  ArrowExportRegular,
  ColumnTripleRegular,
  DeleteRegular,
  EditRegular,
} from '@fluentui/react-icons'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { ProductDialog } from '@/components/dialogs/ProductDialog'
import { PageHeader } from '@/components/PageHeader'
import { PageToolbar } from '@/components/PageToolbar'
import { QueryState } from '@/components/QueryState'
import { TableSkeleton } from '@/components/skeletons'
import { useDeleteProduct, useProducts } from '@/hooks/queries'
import { exportCsv } from '@/lib/exportCsv'
import { formatCurrency } from '@/lib/format'
import { track } from '@/lib/telemetry'
import { useNotify } from '@/lib/toast'
import { type Product } from '@/services/types'

const useStyles = makeStyles({
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalM,
  },
  spacer: { flexGrow: 1 },
})

const columnHelper = createColumnHelper<Product>()

interface ProductsTableProps {
  products: Product[]
  globalFilter: string
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  rowSelection: RowSelectionState
  onRowSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>>
  columnVisibility: VisibilityState
  onColumnVisibilityChange: React.Dispatch<React.SetStateAction<VisibilityState>>
}

function ProductsTable({
  products,
  globalFilter,
  onEdit,
  onDelete,
  rowSelection,
  onRowSelectionChange,
  columnVisibility,
  onColumnVisibilityChange,
}: ProductsTableProps) {
  const styles = useStyles()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllRowsSelected()
                ? true
                : table.getIsSomeRowsSelected()
                  ? 'mixed'
                  : false
            }
            onChange={(_, data) =>
              table.toggleAllRowsSelected(data.checked === true)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(_, data) => row.toggleSelected(data.checked === true)}
            aria-label="Select row"
          />
        ),
      }),
      columnHelper.accessor('name', { header: 'Product' }),
      columnHelper.accessor('sku', { header: 'SKU' }),
      columnHelper.accessor('category', { header: 'Category' }),
      columnHelper.accessor('unitPrice', {
        header: 'Unit price',
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor('stock', { header: 'In stock' }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: '',
        cell: ({ row }) => (
          <div className={styles.actions}>
            <Button
              appearance="subtle"
              size="small"
              icon={<EditRegular />}
              aria-label="Edit"
              onClick={() => onEdit(row.original)}
            />
            <Button
              appearance="subtle"
              size="small"
              icon={<DeleteRegular />}
              aria-label="Delete"
              onClick={() => onDelete(row.original)}
            />
          </div>
        ),
      }),
    ],
    [styles.actions, onEdit, onDelete],
  )

  const table = useReactTable({
    data: products,
    columns,
    state: { sorting, globalFilter, columnFilters, rowSelection, columnVisibility },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onRowSelectionChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <>
      <Table aria-label="Products" sortable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                const canSort = header.column.getCanSort()
                return (
                  <TableHeaderCell
                    key={header.id}
                    onClick={
                      canSort ? header.column.getToggleSortingHandler() : undefined
                    }
                    sortDirection={
                      sorted === 'asc'
                        ? 'ascending'
                        : sorted === 'desc'
                          ? 'descending'
                          : undefined
                    }
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
            <TableRow key={row.id} appearance={row.getIsSelected() ? 'brand' : 'none'}>
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

      <div className={styles.pagination}>
        <Button
          size="small"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          Previous
        </Button>
        <Text size={300}>
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount() || 1}
        </Text>
        <Button
          size="small"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Next
        </Button>
        <div className={styles.spacer} />
        <Text size={300}>{table.getFilteredRowModel().rows.length} item(s)</Text>
      </div>
    </>
  )
}

const HIDEABLE = [
  { id: 'sku', label: 'SKU' },
  { id: 'category', label: 'Category' },
  { id: 'unitPrice', label: 'Unit price' },
  { id: 'stock', label: 'In stock' },
]

export default function ProductsPage() {
  const productsQuery = useProducts()
  const deleteProduct = useDeleteProduct()
  const notify = useNotify()
  const [searchParams, setSearchParams] = useSearchParams()

  const [newOpen, setNewOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Product | undefined>()
  const [bulkOpen, setBulkOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const search = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''

  function setParam(key: string, value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  const all = useMemo(() => productsQuery.data ?? [], [productsQuery.data])
  const categories = useMemo(
    () => [...new Set(all.map((p) => p.category))].sort(),
    [all],
  )
  const data = useMemo(
    () => (category ? all.filter((p) => p.category === category) : all),
    [all, category],
  )

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  function handleExport() {
    const q = search.trim().toLowerCase()
    const rows = q
      ? data.filter(
          (p) =>
            p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
        )
      : data
    exportCsv('products', rows, [
      { key: 'name', header: 'Product' },
      { key: 'sku', header: 'SKU' },
      { key: 'category', header: 'Category' },
      { key: 'unitPrice', header: 'Unit price' },
      { key: 'stock', header: 'In stock' },
    ])
    notify('Exported products', { body: `${rows.length} row(s)` })
  }

  function confirmBulkDelete() {
    selectedIds.forEach((id) => deleteProduct.mutate(id))
    track('products_bulk_deleted', { count: selectedIds.length })
    notify('Deleted products', { body: `${selectedIds.length} removed` })
    setRowSelection({})
  }

  const visibleHideable = (id: string) => columnVisibility[id] !== false

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Headless TanStack Table with sorting, filtering, paging, column visibility, and selection."
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
        <Menu
          checkedValues={{
            columns: HIDEABLE.filter((c) => visibleHideable(c.id)).map((c) => c.id),
          }}
          onCheckedValueChange={(_, { checkedItems }) =>
            setColumnVisibility(
              Object.fromEntries(
                HIDEABLE.map((c) => [c.id, checkedItems.includes(c.id)]),
              ),
            )
          }
        >
          <MenuTrigger disableButtonEnhancement>
            <ToolbarButton icon={<ColumnTripleRegular />}>Columns</ToolbarButton>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {HIDEABLE.map((c) => (
                <MenuItemCheckbox key={c.id} name="columns" value={c.id}>
                  {c.label}
                </MenuItemCheckbox>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
        <ToolbarDivider />
        <SearchBox
          placeholder="Name or SKU"
          value={search}
          onChange={(_, data) => setParam('q', data.value)}
        />
        <Dropdown
          placeholder="All categories"
          value={category}
          selectedOptions={category ? [category] : []}
          onOptionSelect={(_, data) => setParam('category', data.optionValue ?? '')}
        >
          <Option value="">All categories</Option>
          {categories.map((c) => (
            <Option key={c} value={c}>
              {c}
            </Option>
          ))}
        </Dropdown>
        {selectedIds.length > 0 && (
          <>
            <ToolbarDivider />
            <ToolbarButton
              icon={<DeleteRegular />}
              onClick={() => setBulkOpen(true)}
            >
              Delete {selectedIds.length} selected
            </ToolbarButton>
          </>
        )}
      </PageToolbar>

      <ProductDialog open={newOpen} onOpenChange={setNewOpen} />
      <ProductDialog
        open={!!editProduct}
        product={editProduct}
        onOpenChange={(open) => !open && setEditProduct(undefined)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete product"
        message={`Delete “${deleteTarget?.name}”? This cannot be undone.`}
        onConfirm={() => {
          if (deleteTarget) {
            deleteProduct.mutate(deleteTarget.id)
            track('product_deleted', { id: deleteTarget.id })
            notify('Product deleted', { body: deleteTarget.name })
          }
        }}
      />
      <ConfirmDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title="Delete products"
        message={`Delete ${selectedIds.length} selected product(s)? This cannot be undone.`}
        onConfirm={confirmBulkDelete}
      />

      <QueryState
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
        data={productsQuery.data}
        skeleton={<TableSkeleton />}
      >
        {() => (
          <ProductsTable
            products={data}
            globalFilter={search}
            onEdit={setEditProduct}
            onDelete={setDeleteTarget}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
          />
        )}
      </QueryState>
    </>
  )
}
