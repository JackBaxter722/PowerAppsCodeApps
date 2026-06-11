import { makeStyles, Spinner, Text, tokens } from '@fluentui/react-components'
import { type ReactNode } from 'react'

const useStyles = makeStyles({
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
  },
})

interface QueryStateProps<T> {
  isLoading: boolean
  isError: boolean
  data: T | undefined
  children: (data: NonNullable<T>) => ReactNode
  loadingLabel?: string
  emptyLabel?: string
  // Optional skeleton to render while loading instead of the spinner.
  skeleton?: ReactNode
}

export function QueryState<T>({
  isLoading,
  isError,
  data,
  children,
  loadingLabel = 'Loading…',
  emptyLabel = 'Not found.',
  skeleton,
}: QueryStateProps<T>) {
  const styles = useStyles()

  if (isLoading) {
    if (skeleton) return <>{skeleton}</>
    return (
      <div className={styles.center}>
        <Spinner size="medium" label={loadingLabel} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.center}>
        <Text className={styles.error}>Something went wrong loading data.</Text>
      </div>
    )
  }

  if (data === undefined || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className={styles.center}>
        <Text>{emptyLabel}</Text>
      </div>
    )
  }

  return <>{children(data as NonNullable<T>)}</>
}
