import { Suspense } from 'react'
import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { useKeytipRef } from '@fluentui-contrib/react-keytips'
import {
  Button,
  makeStyles,
  Spinner,
  Tab,
  TabList,
  Text,
  tokens,
  type SelectTabEvent,
  type SelectTabData,
} from '@fluentui/react-components'
import {
  AppsListRegular,
  BoxRegular,
  ChatRegular,
  type FluentIcon,
  DataBarVerticalRegular,
  DocumentRegular,
  ReceiptRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons'
import { useDeepLink } from '@/hooks/useDeepLink'
import { useThemeMode } from '@/lib/theme-context'

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gridTemplateRows: 'auto 1fr',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  nav: {
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    padding: tokens.spacingVerticalM,
  },
  content: {
    overflow: 'auto',
    padding: tokens.spacingHorizontalXL,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
})

interface NavEntry {
  value: string
  label: string
  icon: FluentIcon
  keytip: string
}

const NAV: NavEntry[] = [
  { value: '/', label: 'Dashboard', icon: DataBarVerticalRegular, keytip: 'd' },
  { value: '/orders', label: 'Orders', icon: AppsListRegular, keytip: 'o' },
  { value: '/fulfillment', label: 'Fulfillment', icon: BoxRegular, keytip: 'f' },
  { value: '/products', label: 'Products', icon: DocumentRegular, keytip: 'p' },
  { value: '/invoices', label: 'Invoices', icon: ReceiptRegular, keytip: 'i' },
  { value: '/assistant', label: 'Assistant', icon: ChatRegular, keytip: 'a' },
]

function NavItem({ entry }: { entry: NavEntry }) {
  // Each nav item registers a keytip (Alt to reveal) via the contrib library.
  const keytipRef = useKeytipRef<HTMLButtonElement>({
    content: entry.keytip.toUpperCase(),
    keySequences: [entry.keytip],
  })
  const Icon = entry.icon
  return (
    <Tab ref={keytipRef} value={entry.value} icon={<Icon />}>
      {entry.label}
    </Tab>
  )
}

function selectedTab(pathname: string): string {
  const match = NAV.filter((n) => n.value !== '/').find((n) =>
    pathname.startsWith(n.value),
  )
  return match ? match.value : '/'
}

export default function Layout() {
  const styles = useStyles()
  const navigate = useNavigate()
  const location = useLocation()
  const { mode, toggle } = useThemeMode()

  // Read Power Apps getContext query params on startup and deep-link accordingly.
  useDeepLink()

  function onTabSelect(_: SelectTabEvent, data: SelectTabData) {
    navigate(data.value as string)
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <BoxRegular fontSize={24} />
          <Text size={500} weight="bold">
            OrderHub
          </Text>
        </div>
        <Button
          appearance="subtle"
          icon={mode === 'light' ? <WeatherMoonRegular /> : <WeatherSunnyRegular />}
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {mode === 'light' ? 'Dark' : 'Light'}
        </Button>
      </header>

      <nav className={styles.nav}>
        <TabList
          vertical
          selectedValue={selectedTab(location.pathname)}
          onTabSelect={onTabSelect}
        >
          {NAV.map((entry) => (
            <NavItem key={entry.value} entry={entry} />
          ))}
        </TabList>
      </nav>

      <main className={styles.content}>
        <Suspense
          fallback={
            <div className={styles.loading}>
              <Spinner label="Loading…" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
