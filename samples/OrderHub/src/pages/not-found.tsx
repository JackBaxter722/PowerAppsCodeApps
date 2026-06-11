import { Link as RouterLink } from 'react-router-dom'
import { Button, makeStyles, Text, tokens } from '@fluentui/react-components'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    minHeight: '60vh',
    textAlign: 'center',
  },
})

export default function NotFoundPage() {
  const styles = useStyles()
  return (
    <div className={styles.root}>
      <Text size={900} weight="bold">
        404
      </Text>
      <Text size={400}>This page could not be found.</Text>
      <RouterLink to="/">
        <Button appearance="primary">Back to dashboard</Button>
      </RouterLink>
    </div>
  )
}
