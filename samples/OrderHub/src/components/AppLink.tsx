import { Link } from '@fluentui/react-components'
import { useHref, useLinkClickHandler } from 'react-router-dom'
import { type ReactNode } from 'react'

interface AppLinkProps {
  to: string
  children: ReactNode
}

// A Fluent-styled anchor that performs client-side navigation via React Router.
// useHref + useLinkClickHandler keep it a real <a> (so middle-click / open in new
// tab still work) while intercepting normal clicks for SPA routing.
export function AppLink({ to, children }: AppLinkProps) {
  const href = useHref(to)
  const handleClick = useLinkClickHandler<HTMLAnchorElement>(to)
  return (
    <Link href={href} onClick={handleClick}>
      {children}
    </Link>
  )
}
