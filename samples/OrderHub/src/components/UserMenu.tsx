import {
  Avatar,
  Divider,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  makeStyles,
  Text,
  tokens,
} from '@fluentui/react-components'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const useStyles = makeStyles({
  trigger: {
    border: 'none',
    background: 'none',
    padding: 0,
    cursor: 'pointer',
    borderRadius: tokens.borderRadiusCircular,
  },
  surface: {
    minWidth: '260px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  identity: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: tokens.colorNeutralForeground3,
  },
  value: {
    wordBreak: 'break-all',
  },
})

function Field({ label, value }: { label: string; value?: string }) {
  const styles = useStyles()
  return (
    <div className={styles.field}>
      <Text size={200} className={styles.label}>
        {label}
      </Text>
      <Text size={300} className={styles.value}>
        {value || '—'}
      </Text>
    </div>
  )
}

export function UserMenu() {
  const styles = useStyles()
  const user = useCurrentUser()

  return (
    <Popover positioning="below-end" withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <button className={styles.trigger} aria-label="Account">
          <Avatar
            name={user.fullName}
            initials={user.initials}
            color="colorful"
          />
        </button>
      </PopoverTrigger>
      <PopoverSurface className={styles.surface}>
        <div className={styles.identity}>
          <Avatar
            name={user.fullName}
            initials={user.initials}
            color="colorful"
            size={48}
          />
          <div>
            <Text weight="semibold" block>
              {user.fullName}
            </Text>
            {user.userPrincipalName && (
              <Text size={200} className={styles.label}>
                {user.userPrincipalName}
              </Text>
            )}
          </div>
        </div>
        <Divider />
        <div className={styles.fields}>
          <Field label="Object ID" value={user.objectId} />
          <Field label="Tenant ID" value={user.tenantId} />
        </div>
      </PopoverSurface>
    </Popover>
  )
}
