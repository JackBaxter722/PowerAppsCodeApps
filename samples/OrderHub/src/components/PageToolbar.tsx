import {
  Toolbar,
  makeStyles,
  tokens,
  type ToolbarProps,
} from '@fluentui/react-components'
import { type ReactNode } from 'react'

const useStyles = makeStyles({
  root: {
    flexWrap: 'wrap',
    rowGap: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalL,
    paddingLeft: 0,
    paddingRight: 0,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingBottom: tokens.spacingVerticalS,
  },
})

interface PageToolbarProps {
  children: ReactNode
  ariaLabel: string
  // Forwarded to the underlying Toolbar so pages can use ToolbarToggleButton.
  checkedValues?: ToolbarProps['checkedValues']
  onCheckedValueChange?: ToolbarProps['onCheckedValueChange']
}

// Consistent full-width toolbar row rendered directly under the PageHeader.
export function PageToolbar({
  children,
  ariaLabel,
  checkedValues,
  onCheckedValueChange,
}: PageToolbarProps) {
  const styles = useStyles()
  return (
    <Toolbar
      aria-label={ariaLabel}
      size="small"
      className={styles.root}
      checkedValues={checkedValues}
      onCheckedValueChange={onCheckedValueChange}
    >
      {children}
    </Toolbar>
  )
}
