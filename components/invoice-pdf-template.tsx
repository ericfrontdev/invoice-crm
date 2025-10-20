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

export const InvoicePDFTemplate = React.forwardRef<HTMLDivElement, { invoice: Invoice }>(
  ({ invoice }, ref) => {
    // Déterminer si les taxes sont chargées
    const hasTaxes = invoice.tps > 0 || invoice.tvq > 0

    return (
      <div ref={ref} className="p-12 bg-white text-black" style={{ width: '210mm', minHeight: '297mm' }}>
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">FACTURE</h1>
              <p className="text-xl text-gray-600 mt-2">{invoice.number}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">[VOTRE ENTREPRISE]</p>
              <p className="text-sm text-gray-600">[Adresse]</p>
              <p className="text-sm text-gray-600">[Code postal et ville]</p>
              <p className="text-sm text-gray-600">Québec, Canada</p>
              <p className="text-sm text-gray-600">[Téléphone]</p>
              <p className="text-sm text-gray-600">[Courriel]</p>
              <p className="text-sm text-gray-600 mt-2">NEQ : [Numéro NEQ]</p>
              <p className="text-sm text-gray-600">TPS : [Numéro TPS]</p>
              <p className="text-sm text-gray-600">TVQ : [Numéro TVQ]</p>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="mb-8 bg-gray-50 p-6 rounded">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Facturé à</h2>
          <p className="text-lg font-semibold">{invoice.client.company || invoice.client.name}</p>
          {invoice.client.company && invoice.client.name && (
            <p className="text-gray-700">{invoice.client.name}</p>
          )}
          <p className="text-gray-700">{invoice.client.address}</p>
          <p className="text-gray-700">{invoice.client.email}</p>
        </div>

        {/* Informations facture */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-500">Date d&apos;émission</p>
            <p className="text-gray-900">
              {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Statut</p>
            <p className="text-gray-900 capitalize">{invoice.status}</p>
          </div>
        </div>

        {/* Tableau des items */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-3 text-sm font-semibold text-gray-500 uppercase">
                  Description
                </th>
                <th className="text-left py-3 text-sm font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-500 uppercase">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-4 text-gray-900">{item.description}</td>
                  <td className="py-4 text-gray-700">
                    {new Date(item.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-4 text-right text-gray-900 font-medium">
                    {item.amount.toFixed(2)} $
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total avec ou sans taxes */}
        <div className="flex justify-end mb-12">
          <div className="w-80">
            {hasTaxes ? (
              <>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900">{invoice.subtotal.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">TPS (5%)</span>
                  <span className="text-gray-900">{invoice.tps.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">TVQ (9,975%)</span>
                  <span className="text-gray-900">{invoice.tvq.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">{invoice.total.toFixed(2)} $</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-3 border-t-2 border-gray-900">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">{invoice.total.toFixed(2)} $</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="border-t pt-8">
          <p className="text-sm text-gray-600">
            <strong>Conditions de paiement :</strong> Paiement sous 30 jours
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Mode de paiement :</strong> Virement bancaire
          </p>
          <p className="text-sm text-gray-600 mt-4">
            Merci pour votre confiance !
          </p>
        </div>

        {/* Pied de page */}
        <div className="absolute bottom-8 left-12 right-12 text-center text-xs text-gray-500 border-t pt-4">
          <p>[VOTRE ENTREPRISE] - NEQ: [Numéro] - TPS: [Numéro] - TVQ: [Numéro]</p>
          <p>[Adresse complète], Québec, Canada - [Téléphone] - [Courriel]</p>
        </div>
      </div>
    )
  }
)

InvoicePDFTemplate.displayName = 'InvoicePDFTemplate'
