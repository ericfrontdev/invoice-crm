import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'

export default getRequestConfig(async () => {
  // Detect locale from pathname or default to 'fr'
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const locale = pathname.startsWith('/en') ? 'en' : 'fr'

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  }
})
