import { useState } from 'react'
import { Chat, ChatMessage, ChatMyMessage } from '@fluentui-contrib/react-chat'
import {
  Button,
  makeStyles,
  Textarea,
  tokens,
  ToolbarButton,
  ToolbarDivider,
  ToolbarRadioButton,
  ToolbarRadioGroup,
} from '@fluentui/react-components'
import {
  AddRegular,
  DeleteRegular,
  SendRegular,
} from '@fluentui/react-icons'
import { PageHeader } from '@/components/PageHeader'
import { PageToolbar } from '@/components/PageToolbar'

type Persona = 'concise' | 'detailed'

interface Message {
  id: number
  mine: boolean
  text: string
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 220px)',
    maxWidth: '720px',
  },
  thread: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: tokens.spacingVerticalM,
  },
  composer: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'flex-end',
    paddingTop: tokens.spacingVerticalM,
  },
  input: {
    flexGrow: 1,
  },
})

const INITIAL: Message[] = [
  {
    id: 0,
    mine: false,
    text: 'Hi! I can help you find orders, invoices, and products. Ask me anything.',
  },
]

function mockReply(prompt: string): string {
  const text = prompt.toLowerCase()
  if (text.includes('overdue')) {
    return 'You can see overdue invoices on the Invoices page filtered by status=overdue.'
  }
  if (text.includes('order')) {
    return 'Open the Orders page to browse, or drag cards on the Fulfillment board to update status.'
  }
  if (text.includes('revenue') || text.includes('dashboard')) {
    return 'The Dashboard shows revenue over time, orders by status, and top products.'
  }
  return `Thanks for your message: “${prompt}”. (This is a mock assistant for the sample.)`
}

export default function AssistantPage() {
  const styles = useStyles()
  const [messages, setMessages] = useState<Message[]>(INITIAL)
  const [draft, setDraft] = useState('')
  const [persona, setPersona] = useState<Persona>('concise')

  function send() {
    const trimmed = draft.trim()
    if (!trimmed) return
    const reply = mockReply(trimmed)
    const text =
      persona === 'detailed'
        ? `${reply} Let me know if you'd like step-by-step guidance.`
        : reply
    setMessages((prev) => [
      ...prev,
      { id: prev.length, mine: true, text: trimmed },
      { id: prev.length + 1, mine: false, text },
    ])
    setDraft('')
  }

  return (
    <>
      <PageHeader
        title="Assistant"
        subtitle="Order-support chat built with @fluentui-contrib/react-chat (mock replies)."
      />
      <PageToolbar ariaLabel="Assistant actions">
        <ToolbarButton
          icon={<AddRegular />}
          onClick={() => {
            setMessages(INITIAL)
            setDraft('')
          }}
        >
          New conversation
        </ToolbarButton>
        <ToolbarButton
          icon={<DeleteRegular />}
          onClick={() => setMessages([])}
          disabled={messages.length === 0}
        >
          Clear
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarRadioGroup>
          <ToolbarRadioButton
            name="persona"
            value="concise"
            appearance={persona === 'concise' ? 'primary' : 'subtle'}
            onClick={() => setPersona('concise')}
          >
            Concise
          </ToolbarRadioButton>
          <ToolbarRadioButton
            name="persona"
            value="detailed"
            appearance={persona === 'detailed' ? 'primary' : 'subtle'}
            onClick={() => setPersona('detailed')}
          >
            Detailed
          </ToolbarRadioButton>
        </ToolbarRadioGroup>
      </PageToolbar>
      <div className={styles.container}>
        <Chat className={styles.thread}>
          {messages.map((message) =>
            message.mine ? (
              <ChatMyMessage key={message.id}>{message.text}</ChatMyMessage>
            ) : (
              <ChatMessage key={message.id} author="Assistant">
                {message.text}
              </ChatMessage>
            ),
          )}
        </Chat>
        <div className={styles.composer}>
          <Textarea
            className={styles.input}
            placeholder="Ask about orders, invoices, or revenue…"
            value={draft}
            onChange={(_, data) => setDraft(data.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send()
              }
            }}
          />
          <Button
            appearance="primary"
            icon={<SendRegular />}
            onClick={send}
            disabled={!draft.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </>
  )
}
