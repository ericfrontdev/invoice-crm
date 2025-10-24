import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components'

interface FeedbackMessageNotificationProps {
  feedbackId: string
  feedbackTitle: string
  messageAuthorName: string
  messageAuthorType: 'admin' | 'user'
  messageContent: string
  feedbackUrl: string
  recipientName: string
}

export default function FeedbackMessageNotification({
  feedbackId,
  feedbackTitle,
  messageAuthorName,
  messageAuthorType,
  messageContent,
  feedbackUrl,
  recipientName,
}: FeedbackMessageNotificationProps) {
  const isAdminMessage = messageAuthorType === 'admin'
  const authorLabel = isAdminMessage ? '👑 Admin' : messageAuthorName

  return (
    <Html>
      <Head />
      <Preview>
        Nouveau message sur: {feedbackTitle}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>💬 Nouveau Message</Heading>
          </Section>

          <Section style={box}>
            <Text style={text}>Bonjour {recipientName},</Text>

            <Text style={text}>
              Vous avez reçu un nouveau message sur votre feedback:
            </Text>

            <div style={feedbackBox}>
              <Text style={feedbackTitleStyle}>{feedbackTitle}</Text>
            </div>

            <Text style={label}>Message de {authorLabel}:</Text>
            <div style={messageBox}>
              <Text style={messageText}>{messageContent}</Text>
            </div>

            <Section style={buttonSection}>
              <Button href={feedbackUrl} style={button}>
                Voir et répondre
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Vous recevez cet email car vous êtes concerné par ce feedback.
            <br />
            Connectez-vous pour consulter la conversation complète.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const box = {
  padding: '0 48px',
}

const headerSection = {
  padding: '20px 48px 0 48px',
}

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '20px 0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '12px 0',
}

const label = {
  color: '#666',
  fontSize: '14px',
  fontWeight: '600',
  margin: '16px 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const feedbackBox = {
  backgroundColor: '#EEF2FF',
  border: '1px solid #C7D2FE',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '16px 0',
}

const feedbackTitleStyle = {
  color: '#4F46E5',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
}

const messageBox = {
  backgroundColor: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
}

const messageText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 48px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  padding: '0 48px',
  textAlign: 'center' as const,
}
