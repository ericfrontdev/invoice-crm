'use client'

import React from 'react'

type Invoice = {
  id: string
  number: string
  status: string
  subtotal: number
  tps: number
  tvq: number
  total: number
  createdAt: Date
  client: {
    name: string
    company: string | null
    email: string
    address: string | null
  }
  items: Array<{
    description: string
    amount: number
    date: Date
    dueDate: Date | null
  }>
}

type User = {
  name: string
  company: string | null
  address: string | null
  phone: string | null
  email: string
  neq: string | null
  tpsNumber: string | null
  tvqNumber: string | null
  logo: string | null
}

export const InvoicePDFTemplate = React.forwardRef<
  HTMLDivElement,
  { invoice: Invoice; user: User; forPrint?: boolean }
>(({ invoice, user, forPrint = false }, ref) => {
  // Déterminer si les taxes sont chargées
  const hasTaxes = invoice.tps > 0 || invoice.tvq > 0

  return (
    <div
      ref={ref}
      className={
        forPrint
          ? 'p-8 bg-white text-black flex flex-col w-full'
          : 'p-4 md:p-12 bg-white text-black flex flex-col w-full'
      }
      style={{ maxWidth: '210mm', minHeight: '297mm' }}
    >
      {/* En-tête */}
      <div className={forPrint ? 'mb-3' : 'mb-6 md:mb-8'}>
        <div
          className={
            forPrint
              ? 'flex flex-row justify-between items-start gap-4'
              : 'flex flex-col md:flex-row md:justify-between md:items-start gap-4'
          }
        >
          <div>
            {user.logo ? (
              <img
                src={user.logo}
                alt="Logo"
                className={
                  forPrint
                    ? 'h-16 w-auto mb-2'
                    : 'h-12 md:h-16 w-auto mb-2 md:mb-4'
                }
                style={{ maxWidth: '200px', objectFit: 'contain' }}
              />
            ) : (
              <h1
                className={
                  forPrint
                    ? 'text-4xl font-bold text-gray-900'
                    : 'text-2xl md:text-4xl font-bold text-gray-900'
                }
              >
                FACTURE
              </h1>
            )}
            <p
              className={
                forPrint
                  ? 'text-xl text-gray-600 mt-1'
                  : 'text-lg md:text-xl text-gray-600 mt-1 md:mt-2'
              }
            >
              {invoice.number}
            </p>
          </div>
          <div className={forPrint ? 'text-right' : 'text-left md:text-right'}>
            <p
              className={
                forPrint
                  ? 'text-lg font-semibold'
                  : 'text-base md:text-lg font-semibold'
              }
            >
              {user.company || user.name}
            </p>
            {user.address && (
              <p
                className={
                  forPrint
                    ? 'text-sm text-gray-600'
                    : 'text-xs md:text-sm text-gray-600'
                }
              >
                {user.address}
              </p>
            )}
            <p
              className={
                forPrint
                  ? 'text-sm text-gray-600'
                  : 'text-xs md:text-sm text-gray-600'
              }
            >
              Québec, Canada
            </p>
            {user.phone && (
              <p
                className={
                  forPrint
                    ? 'text-sm text-gray-600'
                    : 'text-xs md:text-sm text-gray-600'
                }
              >
                {user.phone}
              </p>
            )}
            {user.email && (
              <p
                className={
                  forPrint
                    ? 'text-sm text-gray-600'
                    : 'text-xs md:text-sm text-gray-600'
                }
              >
                {user.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div
        className={
          forPrint
            ? 'mb-3 bg-gray-50 p-3 rounded'
            : 'mb-6 md:mb-8 bg-gray-50 p-4 md:p-6 rounded'
        }
      >
        <h2 className="text-xs md:text-sm font-semibold text-gray-500 uppercase mb-2 md:mb-3">
          Facturé à
        </h2>
        <p className="text-base md:text-lg font-semibold">
          {invoice.client.company || invoice.client.name}
        </p>
        {invoice.client.company && invoice.client.name && (
          <p className="text-sm md:text-base text-gray-700">
            {invoice.client.name}
          </p>
        )}
        <p className="text-sm md:text-base text-gray-700">
          {invoice.client.address}
        </p>
        <p className="text-sm md:text-base text-gray-700">
          {invoice.client.email}
        </p>
      </div>

      {/* Informations facture */}
      <div
        className={
          forPrint
            ? 'mb-3 grid grid-cols-2 gap-3'
            : 'mb-6 md:mb-8 grid grid-cols-2 gap-3 md:gap-4'
        }
      >
        <div>
          <p className="text-xs md:text-sm font-semibold text-gray-500">
            Date d&apos;émission
          </p>
          <p className="text-sm md:text-base text-gray-900">
            {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-xs md:text-sm font-semibold text-gray-500">
            Statut
          </p>
          <p className="text-sm md:text-base text-gray-900 capitalize">
            {invoice.status}
          </p>
        </div>
      </div>

      {/* Tableau des items */}
      <div
        className={
          forPrint ? 'mb-3 overflow-x-auto' : 'mb-6 md:mb-8 overflow-x-auto'
        }
      >
        <table className="w-full text-sm md:text-base">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-500 uppercase">
                Description
              </th>
              <th className="text-left py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-500 uppercase">
                Date
              </th>
              <th className="text-right py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-500 uppercase">
                Montant
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-200"
              >
                <td className="py-3 md:py-4 text-gray-900">
                  {item.description}
                </td>
                <td className="py-3 md:py-4 text-gray-700 whitespace-nowrap">
                  {new Date(item.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="py-3 md:py-4 text-right text-gray-900 font-medium whitespace-nowrap">
                  {item.amount.toFixed(2)} $
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total avec ou sans taxes */}
      <div
        className={
          forPrint ? 'flex justify-end mb-3' : 'flex justify-end mb-8 md:mb-12'
        }
      >
        <div className="w-full md:w-80">
          {hasTaxes ? (
            <>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Sous-total</span>
                <span className="text-gray-900">
                  {invoice.subtotal.toFixed(2)} $
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">TPS (5%)</span>
                <span className="text-gray-900">
                  {invoice.tps.toFixed(2)} $
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">TVQ (9,975%)</span>
                <span className="text-gray-900">
                  {invoice.tvq.toFixed(2)} $
                </span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">
                  {invoice.total.toFixed(2)} $
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between py-3 border-t-2 border-gray-900">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold">
                {invoice.total.toFixed(2)} $
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className={forPrint ? 'border-t pt-2' : 'border-t pt-6 md:pt-8'}>
        <p className="text-xs md:text-sm mt-6 text-gray-600">
          <strong>Conditions de paiement :</strong> Paiement sous 30 jours
        </p>
        <p className="text-xs md:text-sm text-gray-600 mt-2">
          <strong>Mode de paiement :</strong> Virement bancaire
        </p>
        <p
          className={
            forPrint
              ? 'text-xs md:text-sm text-gray-600 mb-6 mt-2'
              : 'text-xs md:text-sm text-gray-600 mt-3 md:mt-4'
          }
        >
          Merci pour votre confiance !
        </p>
      </div>

      {/* Pied de page */}
      <div
        className={
          forPrint
            ? 'pt-2 text-center text-xs text-gray-500 border-t'
            : 'mt-auto pt-6 md:pt-8 text-center text-xs text-gray-500 border-t'
        }
      >
        <p className="break-words mt-4">
          {user.company || user.name}
          {user.neq && ` - NEQ: ${user.neq}`}
          {user.tpsNumber && ` - TPS: ${user.tpsNumber}`}
          {user.tvqNumber && ` - TVQ: ${user.tvqNumber}`}
        </p>
        <p className="break-words">
          {user.address && `${user.address}, `}Québec, Canada
          {user.phone && ` - ${user.phone}`}
          {user.email && ` - ${user.email}`}
        </p>
      </div>
    </div>
  )
})

InvoicePDFTemplate.displayName = 'InvoicePDFTemplate'
