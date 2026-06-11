import { useSearchParams } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { AppLink } from '@/components/AppLink'
import { PageHeader } from '@/components/PageHeader'
import { QueryState } from '@/components/QueryState'
import { InvoiceStatusBadge } from '@/components/StatusBadge'
import { useInvoices } from '@/hooks/queries'
import { formatCurrency, formatDate } from '@/lib/format'

export default function InvoicesPage() {
  const invoicesQuery = useInvoices()
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') ?? ''

  const invoices = (invoicesQuery.data ?? []).filter(
    (inv) => !statusFilter || inv.status === statusFilter,
  )

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
      <QueryState
        isLoading={invoicesQuery.isLoading}
        isError={invoicesQuery.isError}
        data={invoicesQuery.data}
        loadingLabel="Loading invoices…"
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
