'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n-context'
import { AlertTriangle, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type User = {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  address: string | null
  neq: string | null
  tpsNumber: string | null
  tvqNumber: string | null
  chargesTaxes: boolean
  paymentProvider: string | null
  paypalEmail: string | null
  stripeSecretKey: string | null
  logo: string | null
  autoRemindersEnabled: boolean
  reminderMiseEnDemeureTemplate: string | null
  plan: string | null
  subscriptionStatus: string | null
  subscriptionEndsAt: Date | null
}

export function ProfileForm({ user }: { user: User }) {
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    company: user.company || '',
    phone: user.phone || '',
    address: user.address || '',
    neq: user.neq || '',
    tpsNumber: user.tpsNumber || '',
    tvqNumber: user.tvqNumber || '',
    chargesTaxes: user.chargesTaxes,
    paymentProvider: user.paymentProvider || '',
    paypalEmail: user.paypalEmail || '',
    stripeSecretKey: user.stripeSecretKey || '',
    autoRemindersEnabled: user.autoRemindersEnabled,
    reminderMiseEnDemeureTemplate: user.reminderMiseEnDemeureTemplate || '',
  })
  const [logo, setLogo] = useState<string | null>(user.logo)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const uploadFile = async (file: File) => {
    setIsUploadingLogo(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const res = await fetch('/api/user/logo', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || t('errors.uploadFailed'))
      }

      const data = await res.json()
      setLogo(data.logoUrl)
      setMessage({ type: 'success', text: t('profile.logoUploaded') })
      router.refresh()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('errors.uploadFailed')
      })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: t('errors.fileTypeNotSupported') })
      return
    }

    await uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleLogoDelete = async () => {
    setIsUploadingLogo(true)
    setMessage(null)

    try {
      const res = await fetch('/api/user/logo', {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error(t('errors.deleteFailed'))
      }

      setLogo(null)
      setMessage({ type: 'success', text: t('profile.logoRemoved') })
      router.refresh()
    } catch (_error) {
      setMessage({ type: 'error', text: t('errors.deleteFailed') })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error(t('errors.updateFailed'))
      }

      setMessage({ type: 'success', text: t('profile.profileUpdated') })
      router.refresh()
    } catch (_error) {
      setMessage({ type: 'error', text: t('errors.updateFailed') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCancelingSubscription(true)
    setMessage(null)

    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || t('profile.cancelError'))
      }

      setMessage({
        type: 'success',
        text: t('profile.subscriptionCanceled') + ' ' + new Date(data.endsAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US'),
      })

      setShowCancelSubscriptionDialog(false)
      router.refresh()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('profile.cancelError'),
      })
    } finally {
      setIsCancelingSubscription(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || t('profile.deleteAccountError'))
      }

      // Rediriger vers la page d'accueil après suppression
      window.location.href = '/'
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('profile.deleteAccountError'),
      })
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-2 block">{t('profile.fullName')} *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="mb-2 block">{t('profile.email')} *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="company" className="mb-2 block">{t('profile.businessName')}</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>

        {/* Logo */}
        <div className="pt-4 border-t">
          <Label className="mb-2 block">{t('profile.logo')}</Label>
          <p className="text-sm text-muted-foreground mb-3">
            {t('profile.logoDescription')}
          </p>

          {logo ? (
            <div className="flex items-start gap-4">
              <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-white">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={isUploadingLogo}
                  className="cursor-pointer"
                >
                  {isUploadingLogo ? t('profile.uploading') : t('profile.changeLogo')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogoDelete}
                  disabled={isUploadingLogo}
                  className="cursor-pointer"
                >
                  {t('profile.removeLogo')}
                </Button>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              } ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !isUploadingLogo && document.getElementById('logo-upload')?.click()}
            >
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm font-medium">
                {isUploadingLogo
                  ? t('profile.uploading')
                  : isDragging
                  ? t('profile.dropFile')
                  : t('profile.dragDropOrClick')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('profile.logoFormats')}
              </p>
            </div>
          )}
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            disabled={isUploadingLogo}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="mb-2 block">{t('profile.phone')}</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="address" className="mb-2 block">{t('profile.businessAddress')}</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* Champs spécifiques Québec */}
        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-4">{t('profile.taxSettings')}</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="neq" className="mb-2 block">
                {t('profile.neq')}
              </Label>
              <Input
                id="neq"
                value={formData.neq}
                onChange={(e) => setFormData({ ...formData, neq: e.target.value })}
                placeholder={t('profile.neqPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="tpsNumber" className="mb-2 block">
                {t('profile.tpsNumber')}
              </Label>
              <Input
                id="tpsNumber"
                value={formData.tpsNumber}
                onChange={(e) => setFormData({ ...formData, tpsNumber: e.target.value })}
                placeholder={t('profile.tpsPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="tvqNumber" className="mb-2 block">
                {t('profile.tvqNumber')}
              </Label>
              <Input
                id="tvqNumber"
                value={formData.tvqNumber}
                onChange={(e) => setFormData({ ...formData, tvqNumber: e.target.value })}
                placeholder={t('profile.tvqPlaceholder')}
              />
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="chargesTaxes"
                checked={formData.chargesTaxes}
                onChange={(e) => setFormData({ ...formData, chargesTaxes: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <div className="flex-1">
                <Label htmlFor="chargesTaxes" className="cursor-pointer font-medium">
                  {t('profile.chargeTaxes')}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('profile.chargeTaxesDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration des paiements */}
        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-4">{t('profile.paymentSettings')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('profile.paymentSettingsDescription')}
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentProvider" className="mb-2 block">
                {t('profile.paymentProvider')}
              </Label>
              <select
                id="paymentProvider"
                value={formData.paymentProvider}
                onChange={(e) => setFormData({ ...formData, paymentProvider: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">{t('profile.noPaymentProvider')}</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            {formData.paymentProvider === 'paypal' && (
              <div>
                <Label htmlFor="paypalEmail" className="mb-2 block">
                  {t('profile.paypalEmail')}
                </Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={formData.paypalEmail}
                  onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                  placeholder={t('profile.emailPlaceholder')}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('profile.paypalEmailDescription')}
                </p>
              </div>
            )}

            {formData.paymentProvider === 'stripe' && (
              <div>
                <Label htmlFor="stripeSecretKey" className="mb-2 block">
                  {t('profile.stripeSecretKey')}
                </Label>
                <Input
                  id="stripeSecretKey"
                  type="password"
                  value={formData.stripeSecretKey}
                  onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                  placeholder={t('profile.stripePlaceholder')}
                />
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {t('profile.stripeInstructions')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ <strong>{t('common.important')}</strong>: {t('profile.stripeTestMode')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    🔒 {t('profile.stripeSecure')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration des rappels de paiement */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">{t('reminders.title')}</h3>

          <div className="space-y-4">
            {/* Toggle rappels automatiques */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="autoRemindersEnabled"
                checked={formData.autoRemindersEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, autoRemindersEnabled: checked as boolean })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="autoRemindersEnabled"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {t('reminders.enable')}
                </label>
                <p className="text-sm text-muted-foreground">
                  {t('reminders.autoRemindersDescription')}
                </p>
              </div>
            </div>

            {/* Template mise en demeure */}
            {formData.autoRemindersEnabled && (
              <div className="ml-7 space-y-2 pt-2">
                <Label htmlFor="reminderMiseEnDemeureTemplate" className="text-sm">
                  {t('reminders.customTemplate')}
                </Label>
                <Textarea
                  id="reminderMiseEnDemeureTemplate"
                  value={formData.reminderMiseEnDemeureTemplate}
                  onChange={(e) =>
                    setFormData({ ...formData, reminderMiseEnDemeureTemplate: e.target.value })
                  }
                  rows={6}
                  className="font-mono text-sm"
                  placeholder={t('reminders.templatePlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('reminders.templateDescription')}
                </p>
              </div>
            )}

            {!formData.autoRemindersEnabled && (
              <div className="ml-7 p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  {t('reminders.manualRemindersInfo')}
                </p>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`rounded-md p-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-300'
                : 'bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Danger Zone */}
        {(user.plan === 'pro' || user.subscriptionStatus) && (
          <div className="pt-8 mt-8 border-t border-destructive/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">{t('profile.dangerZone')}</h3>
            </div>

            <div className="space-y-4 bg-destructive/5 rounded-lg p-4 border border-destructive/20">
              {/* Annuler l'abonnement */}
              {user.plan === 'pro' && user.subscriptionStatus === 'active' && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{t('profile.cancelSubscription')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('profile.keepAccessUntilEnd')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowCancelSubscriptionDialog(true)}
                    disabled={isCancelingSubscription}
                    className="w-full sm:w-auto shrink-0"
                  >
                    {t('profile.cancelSubscription')}
                  </Button>
                </div>
              )}

              {/* Supprimer le compte */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-destructive/20">
                <div className="flex-1">
                  <p className="font-medium">{t('profile.deleteMyAccount')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('profile.deleteAccountWarning')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteAccountDialog(true)}
                  disabled={isDeletingAccount}
                  className="w-full sm:w-auto shrink-0"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('profile.deleteAccount')}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('profile.saving') : t('common.save')}
          </Button>
        </div>
      </form>

      {/* Dialog - Annuler abonnement */}
      <AlertDialog open={showCancelSubscriptionDialog} onOpenChange={setShowCancelSubscriptionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('profile.cancelSubscriptionTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('profile.cancelSubscriptionDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelingSubscription}>
              {t('common.back')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isCancelingSubscription}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isCancelingSubscription ? t('profile.canceling') : t('profile.confirmCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog - Supprimer compte */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t('profile.deleteAccountTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-destructive">{t('profile.irreversibleAction')}</strong>
              <br /><br />
              {t('profile.deleteAccountDetails')}
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{t('profile.allClients')}</li>
                <li>{t('profile.allInvoices')}</li>
                <li>{t('profile.allProjects')}</li>
                <li>{t('profile.accountingHistory')}</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAccount}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeletingAccount ? t('profile.deleting') : t('profile.confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
