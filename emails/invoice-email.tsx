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

interface InvoiceEmailProps {
  invoiceNumber: string
  clientName: string
  items: Array<{
    description: string
    amount: number
    date: string
  }>
  total: number
}

export default function InvoiceEmail({
  invoiceNumber,
  clientName,
  items,
  total,
}: InvoiceEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Facture {invoiceNumber} - Montant: {total.toFixed(2)} $</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Facture {invoiceNumber}</Heading>

          <Text style={text}>Bonjour {clientName},</Text>

          <Text style={text}>
            Veuillez trouver ci-dessous le détail de votre facture.
          </Text>

          <Section style={box}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={tableHeader}>Description</th>
                  <th style={tableHeader}>Date</th>
                  <th style={{ ...tableHeader, textAlign: 'right' }}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={tableCell}>{item.description}</td>
                    <td style={tableCell}>
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ ...tableCell, textAlign: 'right' }}>
                      {item.amount.toFixed(2)} $
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ ...tableCell, fontWeight: 'bold' }}>
                    Total
                  </td>
                  <td style={{ ...tableCell, textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>
                    {total.toFixed(2)} $
                  </td>
                </tr>
              </tfoot>
            </table>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Conditions de paiement: Payable à réception. Merci de votre confiance.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const box = {
  padding: '0 48px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 48px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
}

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginTop: '20px',
}

const tableHeader = {
  backgroundColor: '#f0f0f0',
  padding: '12px',
  textAlign: 'left' as const,
  fontWeight: 'bold',
  borderBottom: '2px solid #ddd',
}

const tableCell = {
  padding: '12px',
  borderBottom: '1px solid #eee',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 48px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 48px',
}
