import { useParams } from 'react-router-dom'
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
} from '@fluentui/react-components'
import { AppLink } from '@/components/AppLink'
import { PageHeader } from '@/components/PageHeader'
import { QueryState } from '@/components/QueryState'
import { InvoiceStatusBadge } from '@/components/StatusBadge'
import { useInvoice } from '@/hooks/queries'
import { formatCurrency, formatDate } from '@/lib/format'

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
  const { invoiceId } = useParams()
  const invoiceQuery = useInvoice(invoiceId)

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
