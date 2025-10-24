type ReminderEmailProps = {
  invoiceNumber: string
  clientName: string
  amount: number
  dueDate: Date
  paymentUrl: string
  userCompany: string
  userLogo?: string | null
}

export function getReminderSubject(type: string, invoiceNumber: string, daysOverdue?: number): string {
  switch (type) {
    case 'reminder1':
      return `Rappel amical - Facture ${invoiceNumber} échéance dans 3 jours`
    case 'reminder2':
      return `Rappel - Facture ${invoiceNumber} échue depuis 1 jour`
    case 'reminder3':
      return `Rappel urgent - Facture ${invoiceNumber} échue depuis 7 jours`
    case 'mise_en_demeure':
      return `Mise en demeure - Facture ${invoiceNumber} échue depuis 14 jours`
    default:
      return `Rappel - Facture ${invoiceNumber}`
  }
}

export function getReminderEmailHtml({
  type,
  invoiceNumber,
  clientName,
  amount,
  dueDate,
  paymentUrl,
  userCompany,
  userLogo,
  customMessage,
}: ReminderEmailProps & { type: string; customMessage?: string }): string {
  const formattedAmount = amount.toFixed(2)
  const formattedDueDate = dueDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Message selon le type de rappel
  let message = ''
  let showInvoiceDetails = true

  switch (type) {
    case 'reminder1':
      message = `
        <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
          Nous vous informons que la facture <strong>${invoiceNumber}</strong> arrivera à échéance dans 3 jours,
          soit le <strong>${formattedDueDate}</strong>.
        </p>
        <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
          Si vous avez déjà effectué le paiement, veuillez ignorer ce message.
        </p>
      `
      showInvoiceDetails = false
      break

    case 'reminder2':
      message = `
        <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
          Nous constatons que la facture <strong>${invoiceNumber}</strong>, d'un montant de <strong>${formattedAmount} $</strong>,
          est échue depuis le <strong>${formattedDueDate}</strong>.
        </p>
        <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
          Si vous avez déjà effectué le paiement, veuillez ignorer ce message. Sinon, nous vous prions de bien vouloir
          régulariser votre situation dans les plus brefs délais.
        </p>
      `
      break

    case 'reminder3':
      message = `
        <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
          Malgré notre précédent rappel, nous constatons que la facture <strong>${invoiceNumber}</strong>, d'un montant de
          <strong>${formattedAmount} $</strong>, demeure impayée depuis le <strong>${formattedDueDate}</strong>.
        </p>
        <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
          Nous vous prions instamment de régulariser votre situation sous 7 jours, faute de quoi nous nous verrons
          contraints d'envoyer une mise en demeure formelle.
        </p>
      `
      break

    case 'mise_en_demeure':
      message = customMessage || `
        <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
          Madame, Monsieur,
        </p>
        <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
          Malgré nos précédents rappels, nous constatons que la facture ci-dessous demeure impayée.
        </p>
        <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
          Nous vous prions de bien vouloir régulariser votre situation dans les plus brefs délais,
          faute de quoi nous serons contraints d'entamer des procédures de recouvrement.
        </p>
      `
      message += `<p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">Cordialement,</p>`
      break
  }

  // HTML de l'email
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <!-- Header avec logo -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    ${userLogo ? `<img src="${userLogo}" alt="${userCompany}" style="max-height: 60px; max-width: 200px; margin-bottom: 16px;" />` : ''}
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">${userCompany}</h1>
                  </td>
                </tr>

                <!-- Contenu -->
                <tr>
                  <td style="padding: 32px;">
                    <h2 style="margin-top: 0; margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #111827;">
                      ${type === 'reminder1' ? 'Rappel amical' : type === 'reminder2' ? 'Rappel de paiement' : type === 'reminder3' ? 'Rappel urgent' : 'Mise en demeure'}
                    </h2>

                    <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
                      Bonjour ${clientName},
                    </p>

                    ${message}

                    ${showInvoiceDetails ? `
                      <!-- Détails de la facture -->
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 16px; font-weight: 600; color: #111827;">
                          Détails de la facture
                        </h3>
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Numéro de facture:</td>
                            <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; font-size: 14px;">${invoiceNumber}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Montant:</td>
                            <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; font-size: 14px;">${formattedAmount} $</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date d'échéance:</td>
                            <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; font-size: 14px;">${formattedDueDate}</td>
                          </tr>
                        </table>
                      </div>

                      <!-- Bouton de paiement -->
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${paymentUrl}" style="display: inline-block; padding: 12px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Payer maintenant
                        </a>
                      </div>
                    ` : ''}

                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px;">
                      Pour toute question concernant cette facture, n'hésitez pas à nous contacter.
                    </p>

                    <p style="color: #374151; line-height: 1.6; margin-top: 24px;">
                      Cordialement,<br>
                      <strong>${userCompany}</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      Ceci est un email automatique, merci de ne pas y répondre.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}
