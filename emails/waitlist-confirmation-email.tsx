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
  Link,
} from '@react-email/components'

interface WaitlistConfirmationEmailProps {
  userName: string
  appUrl: string
}

export default function WaitlistConfirmationEmail({
  userName,
  appUrl,
}: WaitlistConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue dans la beta privée de SoloPack</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Bienvenue dans la beta SoloPack 🚀</Heading>
          </Section>

          <Section style={box}>
            <Text style={greeting}>Salut {userName}!</Text>

            <Text style={text}>
              Merci de t&apos;être inscrit à la beta privée de SoloPack. Ta place est réservée.
            </Text>

            <Text style={subheading}>Prochaines étapes</Text>

            <Text style={text}>
              • Ton accès sera activé manuellement avant le lancement de la beta.
              <br />
              • Tu recevras un second email avec ton lien d&apos;inscription et un guide de démarrage.
              <br />
              • En tant que beta testeur, tu conserves un rabais à vie sur ton abonnement.
            </Text>

            <Hr style={hr} />

            <Text style={warningText}>
              Une question d&apos;ici là? Réponds simplement à cet email.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Cet email a été envoyé par SoloPack.
            <br />
            <Link href={appUrl} style={footerLink}>
              {appUrl}
            </Link>
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

const greeting = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 16px 0',
}

const subheading = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '32px 0 8px 0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const warningText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  fontStyle: 'italic',
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

const footerLink = {
  color: '#8898aa',
  textDecoration: 'underline',
}
