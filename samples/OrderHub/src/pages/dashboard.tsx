import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  ToolbarButton,
  ToolbarDivider,
  ToolbarRadioButton,
  ToolbarRadioGroup,
} from '@fluentui/react-components'
import {
  ArrowClockwiseRegular,
  ArrowExportRegular,
} from '@fluentui/react-icons'
import { PageHeader } from '@/components/PageHeader'
import { PageToolbar } from '@/components/PageToolbar'
import { QueryState } from '@/components/QueryState'
import { CardsSkeleton } from '@/components/skeletons'
import { useDashboardMetrics } from '@/hooks/queries'
import { exportCsv } from '@/lib/exportCsv'
import { formatCurrency } from '@/lib/format'
import { useNotify } from '@/lib/toast'
import { type DashboardMetrics, type MetricsRange } from '@/services/metricsService'

const RANGES: { value: MetricsRange; label: string }[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' },
]

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
  const navigate = useNavigate()

  const donutData: ChartProps = {
    chartTitle: 'Orders by status',
    chartData: metrics.ordersByStatus.map((d) => ({
      legend: d.status,
      data: d.count,
      // Clicking a slice deep-links into the filtered orders list.
      onClick: () => navigate(`/orders?status=${d.status}`),
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
    // Clicking a bar searches the product catalog for that product.
    onClick: () => navigate(`/products?q=${encodeURIComponent(p.name)}`),
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
  const [range, setRange] = useState<MetricsRange>('all')
  const metricsQuery = useDashboardMetrics(range)
  const notify = useNotify()

  function handleExport() {
    const metrics = metricsQuery.data
    if (!metrics) return
    exportCsv(
      'dashboard-kpis',
      [
        { metric: 'Total revenue', value: metrics.totalRevenue },
        { metric: 'Open orders', value: metrics.openOrders },
        { metric: 'Overdue invoices', value: metrics.overdueInvoices },
        { metric: 'Products', value: metrics.productCount },
      ],
      [
        { key: 'metric', header: 'Metric' },
        { key: 'value', header: 'Value' },
      ],
    )
    notify('Exported dashboard KPIs')
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Order, invoice, and product performance at a glance."
      />
      <PageToolbar ariaLabel="Dashboard actions">
        <ToolbarRadioGroup>
          {RANGES.map((r) => (
            <ToolbarRadioButton
              key={r.value}
              name="range"
              value={r.value}
              appearance={range === r.value ? 'primary' : 'subtle'}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </ToolbarRadioButton>
          ))}
        </ToolbarRadioGroup>
        <ToolbarDivider />
        <ToolbarButton
          icon={<ArrowClockwiseRegular />}
          onClick={() => metricsQuery.refetch()}
          disabled={metricsQuery.isFetching}
        >
          Refresh
        </ToolbarButton>
        <ToolbarButton
          icon={<ArrowExportRegular />}
          onClick={handleExport}
          disabled={!metricsQuery.data}
        >
          Export
        </ToolbarButton>
      </PageToolbar>
      <QueryState
        isLoading={metricsQuery.isLoading}
        isError={metricsQuery.isError}
        data={metricsQuery.data}
        skeleton={<CardsSkeleton cards={4} />}
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
