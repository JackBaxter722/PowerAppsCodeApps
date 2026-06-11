import { useNavigate, useParams } from 'react-router-dom'
import {
  Card,
  Divider,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  tokens,
  ToolbarButton,
  ToolbarDivider,
} from '@fluentui/react-components'
import {
  ArrowLeftRegular,
  CheckmarkCircleRegular,
  PrintRegular,
  ReceiptRegular,
} from '@fluentui/react-icons'
import { AppLink } from '@/components/AppLink'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/PageHeader'
import { PageToolbar } from '@/components/PageToolbar'
import { QueryState } from '@/components/QueryState'
import { InvoiceStatusBadge } from '@/components/StatusBadge'
import { useInvoice, useMarkInvoicePaid } from '@/hooks/queries'
import { formatCurrency, formatDate } from '@/lib/format'
import { useNotify } from '@/lib/toast'

const useStyles = makeStyles({
  summary: {
    display: 'flex',
    gap: tokens.spacingHorizontalXXL,
    flexWrap: 'wrap',
    padding: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalL,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
})

export default function InvoiceDetailPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const notify = useNotify()
  const { invoiceId } = useParams()
  const invoiceQuery = useInvoice(invoiceId)
  const markPaid = useMarkInvoicePaid()

  function handleMarkPaid() {
    if (!invoiceId) return
    markPaid.mutate(invoiceId, {
      onSuccess: () => notify('Invoice marked as paid'),
    })
  }

  return (
    <>
      <PageHeader title="Invoice" subtitle={invoiceId} />
      <QueryState
        isLoading={invoiceQuery.isLoading}
        isError={invoiceQuery.isError}
        data={invoiceQuery.data}
        loadingLabel="Loading invoice…"
        emptyLabel="Invoice not found."
      >
        {(invoice) => (
          <>
            <Breadcrumbs
              items={[
                { label: 'Invoices', to: '/invoices' },
                { label: invoice.invoiceNumber },
              ]}
            />
            <PageToolbar ariaLabel="Invoice actions">
              <ToolbarButton
                icon={<ArrowLeftRegular />}
                onClick={() => navigate('/invoices')}
              >
                Back
              </ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton
                icon={<CheckmarkCircleRegular />}
                onClick={handleMarkPaid}
                disabled={invoice.status === 'paid' || markPaid.isPending}
              >
                Mark as paid
              </ToolbarButton>
              {invoice.order && (
                <ToolbarButton
                  icon={<ReceiptRegular />}
                  onClick={() => navigate(`/orders/${invoice.order!.id}`)}
                >
                  View order
                </ToolbarButton>
              )}
              <ToolbarButton
                icon={<PrintRegular />}
                onClick={() => window.print()}
              >
                Print
              </ToolbarButton>
            </PageToolbar>

            <Card className={styles.summary}>
              <div className={styles.field}>
                <Text size={200}>Invoice number</Text>
                <Text weight="semibold">{invoice.invoiceNumber}</Text>
              </div>
              <div className={styles.field}>
                <Text size={200}>Status</Text>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <div className={styles.field}>
                <Text size={200}>Issued</Text>
                <Text weight="semibold">{formatDate(invoice.issueDate)}</Text>
              </div>
              <div className={styles.field}>
                <Text size={200}>Amount due</Text>
                <Text weight="semibold">{formatCurrency(invoice.amountDue)}</Text>
              </div>
              <div className={styles.field}>
                <Text size={200}>Order</Text>
                {invoice.order ? (
                  <AppLink to={`/orders/${invoice.order.id}`}>
                    {invoice.order.orderNumber}
                  </AppLink>
                ) : (
                  <Text>—</Text>
                )}
              </div>
            </Card>

            <Divider />
            <Text as="h2" size={500} weight="semibold" block>
              Line items
            </Text>
            <Table aria-label="Invoice line items">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Product</TableHeaderCell>
                  <TableHeaderCell>Quantity</TableHeaderCell>
                  <TableHeaderCell>Unit price</TableHeaderCell>
                  <TableHeaderCell>Line total</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.product?.name ?? line.productId}</TableCell>
                    <TableCell>{line.quantity}</TableCell>
                    <TableCell>{formatCurrency(line.unitPrice)}</TableCell>
                    <TableCell>{formatCurrency(line.lineTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </QueryState>
    </>
  )
}
