import { makeStyles, Text, tokens } from '@fluentui/react-components'
import { type ReactNode } from 'react'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalL,
  },
  titles: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
  },
})

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const styles = useStyles()
  return (
    <div className={styles.root}>
      <div className={styles.titles}>
        <Text as="h1" size={700} weight="semibold">
          {title}
        </Text>
        {subtitle && (
          <Text size={300} className={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </div>
      {actions}
    </div>
  )
}
