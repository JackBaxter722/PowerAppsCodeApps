import { useNavigate } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  makeStyles,
  tokens,
} from '@fluentui/react-components'

const useStyles = makeStyles({
  root: {
    marginBottom: tokens.spacingVerticalM,
  },
})

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const styles = useStyles()
  const navigate = useNavigate()

  return (
    <Breadcrumb className={styles.root} aria-label="Breadcrumb">
      {items.map((crumb, i) => {
        const last = i === items.length - 1
        return (
          <span key={`${crumb.label}-${i}`} style={{ display: 'contents' }}>
            <BreadcrumbItem>
              <BreadcrumbButton
                current={last}
                onClick={crumb.to ? () => navigate(crumb.to!) : undefined}
              >
                {crumb.label}
              </BreadcrumbButton>
            </BreadcrumbItem>
            {!last && <BreadcrumbDivider />}
          </span>
        )
      })}
    </Breadcrumb>
  )
}
