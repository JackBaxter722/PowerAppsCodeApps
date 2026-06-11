import {
  Button,
  Hamburger,
  makeStyles,
  Text,
  tokens,
} from '@fluentui/react-components'
import {
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons'
import { GlobalSearch } from '@/components/GlobalSearch'
import { UserMenu } from '@/components/UserMenu'
import { useThemeMode } from '@/lib/theme-context'

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  logo: {
    width: '28px',
    height: '28px',
  },
  spacer: {
    flexGrow: 1,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
})

interface AppHeaderProps {
  onToggleNav: () => void
}

export function AppHeader({ onToggleNav }: AppHeaderProps) {
  const styles = useStyles()
  const { mode, toggle } = useThemeMode()

  return (
    <header className={styles.header}>
      <Hamburger onClick={onToggleNav} aria-label="Toggle navigation" />
      <div className={styles.brand}>
        <img src="/order-hub.svg" alt="" className={styles.logo} />
        <Text size={500} weight="bold">
          OrderHub
        </Text>
      </div>

      <div className={styles.spacer} />

      <GlobalSearch />

      <div className={styles.right}>
        <Button
          appearance="subtle"
          icon={mode === 'light' ? <WeatherMoonRegular /> : <WeatherSunnyRegular />}
          onClick={toggle}
          aria-label="Toggle theme"
        />
        <UserMenu />
      </div>
    </header>
  )
}
