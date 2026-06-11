import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Dropdown,
  Option,
  Table,
  TableBody,
  TableCell,
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
import { AppLink } from '@/components/AppLink'
import { NewInvoiceDialog } from '@/components/dialogs/NewInvoiceDialog'
import { PageHeader } from '@/components/PageHeader'
import { PageToolbar } from '@/components/PageToolbar'
import { QueryState } from '@/components/QueryState'
import { TableSkeleton } from '@/components/skeletons'
import { InvoiceStatusBadge } from '@/components/StatusBadge'
import { useInvoices } from '@/hooks/queries'
import { exportCsv } from '@/lib/exportCsv'
import { formatCurrency, formatDate } from '@/lib/format'
import { useNotify } from '@/lib/toast'
import { INVOICE_STATUSES } from '@/services/types'

export default function InvoicesPage() {
  const invoicesQuery = useInvoices()
  const notify = useNotify()
  const [newOpen, setNewOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') ?? ''

  const invoices = (invoicesQuery.data ?? []).filter(
    (inv) => !statusFilter || inv.status === statusFilter,
  )

  function setStatus(value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set('status', value)
        else next.delete('status')
        return next
      },
      { replace: true },
    )
  }

  function handleExport() {
    exportCsv('invoices', invoices, [
      { key: 'invoiceNumber', header: 'Invoice' },
      { key: 'status', header: 'Status' },
      { key: 'issueDate', header: 'Issued' },
      { key: 'amountDue', header: 'Amount due' },
    ])
    notify('Exported invoices', { body: `${invoices.length} row(s)` })
  }

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle={
          statusFilter
            ? `Filtered to “${statusFilter}” invoices.`
            : 'All invoices.'
        }
      />

      <PageToolbar ariaLabel="Invoices actions">
        <ToolbarButton
          appearance="primary"
          icon={<AddRegular />}
          onClick={() => setNewOpen(true)}
        >
          New invoice
        </ToolbarButton>
        <ToolbarButton
          icon={<ArrowClockwiseRegular />}
          onClick={() => invoicesQuery.refetch()}
          disabled={invoicesQuery.isFetching}
        >
          Refresh
        </ToolbarButton>
        <ToolbarButton icon={<ArrowExportRegular />} onClick={handleExport}>
          Export
        </ToolbarButton>
        <ToolbarDivider />
        <Dropdown
          placeholder="All statuses"
          value={statusFilter}
          selectedOptions={statusFilter ? [statusFilter] : []}
          onOptionSelect={(_, data) => setStatus(data.optionValue ?? '')}
        >
          <Option value="">All statuses</Option>
          {INVOICE_STATUSES.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Dropdown>
      </PageToolbar>

      <NewInvoiceDialog open={newOpen} onOpenChange={setNewOpen} />

      <QueryState
        isLoading={invoicesQuery.isLoading}
        isError={invoicesQuery.isError}
        data={invoicesQuery.data}
        skeleton={<TableSkeleton rows={6} />}
      >
        {() => (
          <Table aria-label="Invoices">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Invoice</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Issued</TableHeaderCell>
                <TableHeaderCell>Amount due</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <AppLink to={`/invoices/${invoice.id}`}>
                      {invoice.invoiceNumber}
                    </AppLink>
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>{formatCurrency(invoice.amountDue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </QueryState>
    </>
  )
}
