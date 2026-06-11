import {
  Skeleton,
  SkeletonItem,
  makeStyles,
  tokens,
} from '@fluentui/react-components'

const useStyles = makeStyles({
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  card: {
    height: '160px',
    borderRadius: tokens.borderRadiusMedium,
  },
})

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  const styles = useStyles()
  return (
    <Skeleton aria-label="Loading">
      <div className={styles.rows}>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonItem key={i} size={32} />
        ))}
      </div>
    </Skeleton>
  )
}

export function CardsSkeleton({ cards = 3 }: { cards?: number }) {
  const styles = useStyles()
  return (
    <Skeleton aria-label="Loading">
      <div className={styles.cards}>
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonItem key={i} className={styles.card} />
        ))}
      </div>
    </Skeleton>
  )
}
