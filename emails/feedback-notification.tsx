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

interface FeedbackNotificationProps {
  feedbackId: string
  feedbackType: string
  feedbackTitle: string
  feedbackMessage: string
  feedbackSeverity: string
  authorName: string
  isAnonymous: boolean
  pageUrl: string
  deviceType?: string
  adminDashboardUrl: string
}

const typeLabels: Record<string, string> = {
  bug: 'Bug',
  feature: 'Nouvelle fonctionnalité',
  improvement: 'Amélioration',
  other: 'Autre',
}

const severityColors: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E',
}

const severityLabels: Record<string, string> = {
  critical: 'Critique',
  high: 'Élevé',
  medium: 'Moyen',
  low: 'Faible',
}

export default function FeedbackNotification({
  feedbackId,
  feedbackType,
  feedbackTitle,
  feedbackMessage,
  feedbackSeverity,
  authorName,
  isAnonymous,
  pageUrl,
  deviceType,
  adminDashboardUrl,
}: FeedbackNotificationProps) {
  const typeLabel = typeLabels[feedbackType] || 'Feedback'
  const severityColor = severityColors[feedbackSeverity] || '#3B82F6'
  const severityLabel = severityLabels[feedbackSeverity] || 'Moyen'
  const displayAuthor = isAnonymous ? 'Utilisateur anonyme' : authorName

  return (
    <Html>
      <Head />
      <Preview>
        Nouveau feedback {typeLabel} - {feedbackTitle}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>
              Nouveau Feedback Reçu
            </Heading>
          </Section>

          <Section style={box}>
            <div style={badge}>
              <span style={{ ...badgeText, backgroundColor: severityColor }}>
                {severityLabel}
              </span>
              <span style={{ ...badgeText, backgroundColor: '#6366F1' }}>
                {typeLabel}
              </span>
            </div>

            <Heading style={h2}>{feedbackTitle}</Heading>

            <Text style={label}>Message:</Text>
            <div style={messageBox}>
              <Text style={messageText}>{feedbackMessage}</Text>
            </div>

            <Hr style={hr} />

            <Text style={label}>Informations:</Text>
            <table style={infoTable}>
              <tbody>
                <tr>
                  <td style={infoLabel}>Auteur:</td>
                  <td style={infoValue}>{displayAuthor}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Page:</td>
                  <td style={infoValue}>{pageUrl}</td>
                </tr>
                {deviceType && (
                  <tr>
                    <td style={infoLabel}>Appareil:</td>
                    <td style={infoValue}>{deviceType}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <Section style={buttonSection}>
              <Button href={adminDashboardUrl} style={button}>
                Voir le feedback
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Vous recevez cet email car vous êtes administrateur de SoloPack.
            <br />
            Connectez-vous au tableau de bord pour gérer ce feedback.
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

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: '600',
  margin: '20px 0 10px 0',
}

const label = {
  color: '#666',
  fontSize: '14px',
  fontWeight: '600',
  margin: '16px 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
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

const infoTable = {
  width: '100%',
  marginTop: '8px',
}

const infoLabel = {
  color: '#666',
  fontSize: '14px',
  padding: '6px 0',
  width: '100px',
  verticalAlign: 'top',
}

const infoValue = {
  color: '#333',
  fontSize: '14px',
  padding: '6px 0',
  verticalAlign: 'top',
}

const badge = {
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
}

const badgeText = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#fff',
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
