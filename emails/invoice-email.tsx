import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface InvoiceEmailProps {
  invoiceNumber: string
  clientName: string
  clientCompany?: string
  clientAddress?: string
  clientEmail?: string
  senderName: string
  senderCompany?: string
  senderAddress?: string
  senderPhone?: string
  senderEmail?: string
  senderLogo?: string
  senderNeq?: string
  senderTpsNumber?: string
  senderTvqNumber?: string
  paymentProvider?: string
  items: Array<{
    description: string
    amount: number
    date: string
  }>
  subtotal: number
  tps: number
  tvq: number
  total: number
  invoiceId: string
  status?: string
  issueDate?: string
  paymentUrl?: string
  /** 'receipt' atteste d'un paiement déjà reçu: aucun bouton de paiement. */
  documentType?: 'invoice' | 'receipt'
  paidAt?: string
  paymentMethodLabel?: string
}

const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  paypal: 'PayPal',
  stripe: 'Stripe',
}

/**
 * Reprend la structure du document affiché dans l'application
 * (components/invoice-pdf-template.tsx): en-tête avec logo et coordonnées,
 * bloc « Facturé à », dates, tableau, totaux et pied de page légal.
 *
 * La mise en page passe par des tableaux et des styles en ligne: flexbox et
 * grid, utilisés côté application, ne sont pas rendus par Outlook.
 */
export default function InvoiceEmail({
  invoiceNumber,
  clientName,
  clientCompany,
  clientAddress,
  clientEmail,
  senderName,
  senderCompany,
  senderAddress,
  senderPhone,
  senderEmail,
  senderLogo,
  senderNeq,
  senderTpsNumber,
  senderTvqNumber,
  paymentProvider,
  items,
  subtotal,
  tps,
  tvq,
  total,
  status,
  issueDate,
  paymentUrl,
  documentType = 'invoice',
  paidAt,
  paymentMethodLabel,
}: InvoiceEmailProps) {
  const hasTaxes = tps > 0 || tvq > 0
  const isReceipt = documentType === 'receipt'
  const documentLabel = isReceipt ? 'Reçu' : 'Facture'
  const senderLine = senderCompany || senderName

  return (
    <Html>
      <Head />
      <Preview>
        {documentLabel} {invoiceNumber} - Montant: {total.toFixed(2)} $
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* En-tête: identité du document à gauche, coordonnées à droite */}
          <Section style={block}>
            <Row>
              <Column style={{ verticalAlign: 'top' }}>
                {senderLogo ? (
                  <Img
                    src={senderLogo}
                    alt={senderLine}
                    height={56}
                    style={logo}
                  />
                ) : (
                  <Text style={documentTitle}>
                    {documentLabel.toUpperCase()}
                  </Text>
                )}
                <Text style={documentNumber}>{invoiceNumber}</Text>
              </Column>
              <Column style={{ verticalAlign: 'top', textAlign: 'right' }}>
                <Text style={senderNameStyle}>{senderLine}</Text>
                {senderAddress && <Text style={senderMeta}>{senderAddress}</Text>}
                <Text style={senderMeta}>Québec, Canada</Text>
                {senderPhone && <Text style={senderMeta}>{senderPhone}</Text>}
                {senderEmail && <Text style={senderMeta}>{senderEmail}</Text>}
              </Column>
            </Row>
          </Section>

          {/* Facturé à */}
          <Section style={block}>
            <Section style={billedToBox}>
              <Text style={sectionLabel}>Facturé à</Text>
              <Text style={billedToName}>{clientCompany || clientName}</Text>
              {clientCompany && clientName && (
                <Text style={billedToLine}>{clientName}</Text>
              )}
              {clientAddress && <Text style={billedToLine}>{clientAddress}</Text>}
              {clientEmail && <Text style={billedToLine}>{clientEmail}</Text>}
            </Section>
          </Section>

          {/* Dates et statut */}
          <Section style={block}>
            <Row>
              <Column style={{ verticalAlign: 'top', width: '50%' }}>
                <Text style={fieldLabel}>Date d&apos;émission</Text>
                <Text style={fieldValue}>{issueDate}</Text>
              </Column>
              <Column style={{ verticalAlign: 'top', width: '50%' }}>
                {isReceipt ? (
                  <>
                    {paidAt && (
                      <>
                        <Text style={fieldLabel}>Payé le</Text>
                        <Text style={fieldValue}>{paidAt}</Text>
                      </>
                    )}
                    {paymentMethodLabel && (
                      <>
                        <Text style={fieldLabel}>Mode de paiement</Text>
                        <Text style={fieldValue}>{paymentMethodLabel}</Text>
                      </>
                    )}
                  </>
                ) : (
                  status && (
                    <>
                      <Text style={fieldLabel}>Statut</Text>
                      <Text style={fieldValue}>{status}</Text>
                    </>
                  )
                )}
              </Column>
            </Row>
          </Section>

          {/* Détail */}
          <Section style={block}>
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
                    <td style={{ ...tableCell, color: '#374151' }}>
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ ...tableCell, textAlign: 'right', fontWeight: 500 }}>
                      {item.amount.toFixed(2)} $
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Totaux, alignés à droite comme dans l'application */}
          <Section style={block}>
            <table style={totalsTable}>
              <tbody>
                {hasTaxes && (
                  <>
                    <tr>
                      <td style={totalsLabel}>Sous-total</td>
                      <td style={totalsValue}>{subtotal.toFixed(2)} $</td>
                    </tr>
                    {tps > 0 && (
                      <tr>
                        <td style={totalsLabel}>TPS (5%)</td>
                        <td style={totalsValue}>{tps.toFixed(2)} $</td>
                      </tr>
                    )}
                    {tvq > 0 && (
                      <tr>
                        <td style={totalsLabel}>TVQ (9,975%)</td>
                        <td style={totalsValue}>{tvq.toFixed(2)} $</td>
                      </tr>
                    )}
                  </>
                )}
                <tr>
                  <td style={grandTotalLabel}>Total</td>
                  <td style={grandTotalValue}>{total.toFixed(2)} $</td>
                </tr>
              </tbody>
            </table>
          </Section>

          {!isReceipt && paymentUrl && (
            <Section style={{ ...block, textAlign: 'center' }}>
              <Button href={paymentUrl} style={payButton}>
                Payer cette facture
              </Button>
              <Text style={payHint}>
                Cliquez sur le bouton ci-dessus pour payer en ligne de manière
                sécurisée.
              </Text>
            </Section>
          )}

          {/* Notes */}
          <Section style={block}>
            <Hr style={hr} />
            {!isReceipt && paymentProvider && (
              <Text style={note}>
                <strong>Mode de paiement :</strong>{' '}
                {PAYMENT_PROVIDER_LABELS[paymentProvider] || 'Virement bancaire'}
              </Text>
            )}
            <Text style={note}>
              {isReceipt
                ? 'Merci, ce reçu confirme le paiement reçu.'
                : 'Merci pour votre confiance !'}
            </Text>
          </Section>

          {/* Pied de page légal */}
          <Section style={block}>
            <Hr style={hr} />
            <Text style={footer}>
              {senderLine}
              {senderNeq && ` - NEQ: ${senderNeq}`}
              {senderTpsNumber && ` - TPS: ${senderTpsNumber}`}
              {senderTvqNumber && ` - TVQ: ${senderTvqNumber}`}
            </Text>
            <Text style={footer}>
              {senderAddress && `${senderAddress}, `}Québec, Canada
              {senderPhone && ` - ${senderPhone}`}
              {senderEmail && ` - ${senderEmail}`}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Fond blanc sur toute la page, comme le document affiché dans l'application.
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '640px',
  padding: '32px 0 48px',
}

const block = {
  padding: '0 48px',
}

const logo = {
  maxWidth: '200px',
  height: '56px',
  objectFit: 'contain' as const,
  margin: '0 0 8px 0',
}

const documentTitle = {
  color: '#111827',
  fontSize: '36px',
  fontWeight: 'bold',
  lineHeight: '40px',
  margin: '0',
}

const documentNumber = {
  color: '#4b5563',
  fontSize: '20px',
  lineHeight: '28px',
  margin: '4px 0 0 0',
}

const senderNameStyle = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: '24px',
  margin: '0',
}

const senderMeta = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const billedToBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '24px',
}

const sectionLabel = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  margin: '0 0 12px 0',
}

const billedToName = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: '24px',
  margin: '0',
}

const billedToLine = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const fieldLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 600,
  margin: '0 0 2px 0',
}

const fieldValue = {
  color: '#111827',
  fontSize: '16px',
  margin: '0 0 12px 0',
}

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const tableHeader = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
  textAlign: 'left' as const,
  padding: '12px 0',
  borderBottom: '2px solid #111827',
}

const tableCell = {
  color: '#111827',
  fontSize: '16px',
  padding: '16px 0',
  borderBottom: '1px solid #e5e7eb',
}

const totalsTable = {
  width: '320px',
  marginLeft: 'auto',
  borderCollapse: 'collapse' as const,
}

const totalsLabel = {
  color: '#4b5563',
  fontSize: '16px',
  padding: '8px 0',
}

const totalsValue = {
  color: '#111827',
  fontSize: '16px',
  padding: '8px 0',
  textAlign: 'right' as const,
}

const grandTotalLabel = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '12px 0',
  borderTop: '2px solid #111827',
}

const grandTotalValue = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '12px 0',
  borderTop: '2px solid #111827',
  textAlign: 'right' as const,
}

const payButton = {
  backgroundColor: '#4F46E5',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
}

const payHint = {
  color: '#4b5563',
  fontSize: '14px',
  marginTop: '12px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const note = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px 0',
}

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
  textAlign: 'center' as const,
  wordBreak: 'break-word' as const,
}
