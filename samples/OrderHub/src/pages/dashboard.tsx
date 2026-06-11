import {
  DonutChart,
  LineChart,
  VerticalBarChart,
  type ChartProps,
  type VerticalBarChartDataPoint,
} from '@fluentui/react-charts'
import {
  Card,
  CardHeader,
  makeStyles,
  Text,
  tokens,
} from '@fluentui/react-components'
import { PageHeader } from '@/components/PageHeader'
import { QueryState } from '@/components/QueryState'
import { useDashboardMetrics } from '@/hooks/queries'
import { formatCurrency } from '@/lib/format'
import { type DashboardMetrics } from '@/services/metricsService'

const useStyles = makeStyles({
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalXL,
  },
  kpiValue: {
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightBold,
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  chartCard: {
    padding: tokens.spacingVerticalL,
  },
  chartArea: {
    height: '280px',
    width: '100%',
  },
})

function KpiCard({ label, value }: { label: string; value: string }) {
  const styles = useStyles()
  return (
    <Card>
      <CardHeader header={<Text weight="semibold">{label}</Text>} />
      <Text className={styles.kpiValue}>{value}</Text>
    </Card>
  )
}

function Charts({ metrics }: { metrics: DashboardMetrics }) {
  const styles = useStyles()

  const donutData: ChartProps = {
    chartTitle: 'Orders by status',
    chartData: metrics.ordersByStatus.map((d) => ({
      legend: d.status,
      data: d.count,
    })),
  }

  const lineData: ChartProps = {
    chartTitle: 'Revenue over time',
    lineChartData: [
      {
        legend: 'Revenue',
        data: metrics.revenueByMonth.map((d) => ({
          x: new Date(`${d.month}-01`),
          y: d.revenue,
        })),
        color: tokens.colorBrandForeground1,
      },
    ],
  }

  const barData: VerticalBarChartDataPoint[] = metrics.topProducts.map((p) => ({
    x: p.name,
    y: p.revenue,
    legend: p.name,
  }))

  return (
    <div className={styles.chartsRow}>
      <Card className={styles.chartCard}>
        <Text weight="semibold">Revenue over time</Text>
        <div className={styles.chartArea}>
          <LineChart data={lineData} />
        </div>
      </Card>
      <Card className={styles.chartCard}>
        <Text weight="semibold">Orders by status</Text>
        <div className={styles.chartArea}>
          <DonutChart data={donutData} innerRadius={55} hideLegend={false} />
        </div>
      </Card>
      <Card className={styles.chartCard}>
        <Text weight="semibold">Top products by revenue</Text>
        <div className={styles.chartArea}>
          <VerticalBarChart data={barData} />
        </div>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const styles = useStyles()
  const metricsQuery = useDashboardMetrics()

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Order, invoice, and product performance at a glance."
      />
      <QueryState
        isLoading={metricsQuery.isLoading}
        isError={metricsQuery.isError}
        data={metricsQuery.data}
        loadingLabel="Loading metrics…"
      >
        {(metrics) => (
          <>
            <div className={styles.kpiRow}>
              <KpiCard
                label="Total revenue"
                value={formatCurrency(metrics.totalRevenue)}
              />
              <KpiCard label="Open orders" value={String(metrics.openOrders)} />
              <KpiCard
                label="Overdue invoices"
                value={String(metrics.overdueInvoices)}
              />
              <KpiCard label="Products" value={String(metrics.productCount)} />
            </div>
            <Charts metrics={metrics} />
          </>
        )}
      </QueryState>
    </>
  )
}
