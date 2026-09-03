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
} from '@react-email/components'

interface WaitlistAdminNotificationProps {
  name: string
  email: string
  company?: string | null
  source: string
  date: string
}

export default function WaitlistAdminNotification({
  name,
  email,
  company,
  source,
  date,
}: WaitlistAdminNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle inscription à la waitlist SoloPack</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Nouvelle inscription beta</Heading>
          </Section>

          <Section style={box}>
            <Text style={text}>
              <strong>Nom :</strong> {name}
              <br />
              <strong>Email :</strong> {email}
              {company ? (
                <>
                  <br />
                  <strong>Entreprise :</strong> {company}
                </>
              ) : null}
              <br />
              <strong>Date :</strong> {date}
              <br />
              <strong>Source :</strong> {source}
            </Text>

            <Hr style={hr} />

            <Text style={warningText}>
              L&apos;inscription est en attente d&apos;approbation. Passer
              <code style={code}>approved = true</code> sur l&apos;entrée Waitlist pour
              autoriser la création du compte.
            </Text>
          </Section>
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
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '20px 0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const warningText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
}

const code = {
  backgroundColor: '#F3F4F6',
  borderRadius: '4px',
  padding: '2px 6px',
  fontSize: '13px',
  margin: '0 4px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 48px',
}
