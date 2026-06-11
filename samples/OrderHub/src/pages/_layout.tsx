import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useKeytipRef } from '@fluentui-contrib/react-keytips'
import {
  NavDrawer,
  NavDrawerBody,
  NavItem,
  Spinner,
  Toaster,
  Tooltip,
  makeStyles,
  mergeClasses,
  tokens,
  type OnNavItemSelectData,
} from '@fluentui/react-components'
import {
  AppsListRegular,
  BoxRegular,
  ChatRegular,
  type FluentIcon,
  DataBarVerticalRegular,
  DocumentRegular,
  ReceiptRegular,
} from '@fluentui/react-icons'
import { AppHeader } from '@/components/AppHeader'
import { useDeepLink } from '@/hooks/useDeepLink'
import { TOASTER_ID, registerErrorNotifier, useNotify } from '@/lib/toast'
import { trackPageView } from '@/lib/telemetry'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  body: {
    display: 'flex',
    flexGrow: 1,
    minHeight: 0,
  },
  // The drawer is always rendered (never hidden); collapsing only minimizes its
  // width to an icon rail.
  drawer: {
    transition: 'width 0.2s ease',
    height: '100%',
  },
  drawerExpanded: {
    width: '260px',
  },
  drawerRail: {
    width: '48px',
    minWidth: '48px',
    overflowX: 'hidden',
  },
  content: {
    flexGrow: 1,
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

function NavEntryItem({
  entry,
  collapsed,
}: {
  entry: NavEntry
  collapsed: boolean
}) {
  // Each nav item registers a keytip (press Alt to reveal) via the contrib lib.
  const keytipRef = useKeytipRef<HTMLAnchorElement | HTMLButtonElement>({
    content: entry.keytip.toUpperCase(),
    keySequences: [entry.keytip],
  })
  const Icon = entry.icon

  const item = (
    <NavItem
      ref={keytipRef}
      value={entry.value}
      icon={<Icon />}
      aria-label={entry.label}
    >
      {collapsed ? undefined : entry.label}
    </NavItem>
  )

  // When collapsed the label is hidden, so expose it via a tooltip.
  return collapsed ? (
    <Tooltip content={entry.label} relationship="label" positioning="after">
      {item}
    </Tooltip>
  ) : (
    item
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
  const [navExpanded, setNavExpanded] = useState(true)
  const notify = useNotify()

  // Read Power Apps getContext query params on startup and deep-link accordingly.
  useDeepLink()

  // Let non-React code (the mutation cache) raise error toasts.
  useEffect(() => {
    registerErrorNotifier((title, body) =>
      notify(title, { body, intent: 'error' }),
    )
    return () => registerErrorNotifier(null)
  }, [notify])

  // Emit a telemetry page-view whenever the route changes.
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  function onNavItemSelect(_: unknown, data: OnNavItemSelectData) {
    if (typeof data.value === 'string') navigate(data.value)
  }

  return (
    <div className={styles.root}>
      <AppHeader onToggleNav={() => setNavExpanded((o) => !o)} />

      <div className={styles.body}>
        <NavDrawer
          // Always open: collapsing minimizes width to a rail rather than hiding.
          open
          type="inline"
          selectedValue={selectedTab(location.pathname)}
          onNavItemSelect={onNavItemSelect}
          className={mergeClasses(
            styles.drawer,
            navExpanded ? styles.drawerExpanded : styles.drawerRail,
          )}
        >
          <NavDrawerBody>
            {NAV.map((entry) => (
              <NavEntryItem
                key={entry.value}
                entry={entry}
                collapsed={!navExpanded}
              />
            ))}
          </NavDrawerBody>
        </NavDrawer>

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

      <Toaster toasterId={TOASTER_ID} />
    </div>
  )
}
