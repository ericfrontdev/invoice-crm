'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n-context'

export function CGUPageClient() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('legal.backToHome')}
          </Button>
        </Link>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1>{t('legal.tou.title')}</h1>
        <p className="text-muted-foreground">
          {t('legal.lastUpdate')}: {new Date().toLocaleDateString(t('common.locale'))}
        </p>

        <h2>1. {t('legal.tou.section1.title')}</h2>
        <p>{t('legal.tou.section1.p1')}</p>
        <p>{t('legal.tou.section1.p2')}</p>

        <h2>2. {t('legal.tou.section2.title')}</h2>
        <ul>
          <li><strong>{t('legal.tou.section2.service')}</strong>: {t('legal.tou.section2.serviceDesc')}</li>
          <li><strong>{t('legal.tou.section2.user')}</strong>: {t('legal.tou.section2.userDesc')}</li>
          <li><strong>{t('legal.tou.section2.account')}</strong>: {t('legal.tou.section2.accountDesc')}</li>
          <li><strong>{t('legal.tou.section2.editor')}</strong>: {t('legal.tou.section2.editorDesc')}</li>
        </ul>

        <h2>3. {t('legal.tou.section3.title')}</h2>
        <h3>3.1. {t('legal.tou.section3.sub1.title')}</h3>
        <p>{t('legal.tou.section3.sub1.p1')}</p>
        <p>{t('legal.tou.section3.sub1.p2')}</p>

        <h3>3.2. {t('legal.tou.section3.sub2.title')}</h3>
        <p>{t('legal.tou.section3.sub2.p1')}</p>

        <h2>4. {t('legal.tou.section4.title')}</h2>
        <h3>4.1. {t('legal.tou.section4.sub1.title')}</h3>
        <p>{t('legal.tou.section4.sub1.intro')}:</p>
        <ul>
          <li>{t('legal.tou.section4.sub1.item1')}</li>
          <li>{t('legal.tou.section4.sub1.item2')}</li>
          <li>{t('legal.tou.section4.sub1.item3')}</li>
          <li>{t('legal.tou.section4.sub1.item4')}</li>
        </ul>

        <h3>4.2. {t('legal.tou.section4.sub2.title')}</h3>
        <p>{t('legal.tou.section4.sub2.intro')}:</p>
        <ul>
          <li>{t('legal.tou.section4.sub2.item1')}</li>
          <li>{t('legal.tou.section4.sub2.item2')}</li>
          <li>{t('legal.tou.section4.sub2.item3')}</li>
          <li>{t('legal.tou.section4.sub2.item4')}</li>
          <li>{t('legal.tou.section4.sub2.item5')}</li>
          <li>{t('legal.tou.section4.sub2.item6')}</li>
        </ul>

        <h2>5. {t('legal.tou.section5.title')}</h2>
        <p>{t('legal.tou.section5.p1')}</p>
        <p>{t('legal.tou.section5.p2')}</p>
        <p>{t('legal.tou.section5.p3')}</p>

        <h2>6. {t('legal.tou.section6.title')}</h2>
        <h3>6.1. {t('legal.tou.section6.sub1.title')}</h3>
        <p>{t('legal.tou.section6.sub1.intro')}:</p>
        <ul>
          <li>{t('legal.tou.section6.sub1.item1')}</li>
          <li>{t('legal.tou.section6.sub1.item2')}</li>
          <li>{t('legal.tou.section6.sub1.item3')}</li>
          <li>{t('legal.tou.section6.sub1.item4')}</li>
        </ul>

        <h3>6.2. {t('legal.tou.section6.sub2.title')}</h3>
        <p>{t('legal.tou.section6.sub2.intro')}:</p>
        <ul>
          <li>{t('legal.tou.section6.sub2.item1')}</li>
          <li>{t('legal.tou.section6.sub2.item2')}</li>
          <li>{t('legal.tou.section6.sub2.item3')}</li>
          <li>{t('legal.tou.section6.sub2.item4')}</li>
        </ul>

        <h2>7. {t('legal.tou.section7.title')}</h2>
        <p>
          {t('legal.tou.section7.p1')}{' '}
          <Link href="/politique-confidentialite" className="text-primary hover:underline">
            {t('legal.privacyPolicy')}
          </Link>, {t('legal.tou.section7.p1b')}.
        </p>
        <p>{t('legal.tou.section7.p2')}</p>

        <h2>8. {t('legal.tou.section8.title')}</h2>
        <h3>8.1. {t('legal.tou.section8.sub1.title')}</h3>
        <p>{t('legal.tou.section8.sub1.p1')}</p>

        <h3>8.2. {t('legal.tou.section8.sub2.title')}</h3>
        <p>{t('legal.tou.section8.sub2.p1')}</p>

        <h3>8.3. {t('legal.tou.section8.sub3.title')}</h3>
        <p>{t('legal.tou.section8.sub3.p1')}</p>

        <h2>9. {t('legal.tou.section9.title')}</h2>
        <h3>9.1. {t('legal.tou.section9.sub1.title')}</h3>
        <p>{t('legal.tou.section9.sub1.p1')}</p>

        <h3>9.2. {t('legal.tou.section9.sub2.title')}</h3>
        <p>{t('legal.tou.section9.sub2.p1')}</p>

        <h3>9.3. {t('legal.tou.section9.sub3.title')}</h3>
        <p>{t('legal.tou.section9.sub3.intro')}:</p>
        <ul>
          <li>{t('legal.tou.section9.sub3.item1')}</li>
          <li>{t('legal.tou.section9.sub3.item2')}</li>
          <li>{t('legal.tou.section9.sub3.item3')}</li>
          <li>{t('legal.tou.section9.sub3.item4')}</li>
        </ul>

        <h3>9.4. {t('legal.tou.section9.sub4.title')}</h3>
        <p>{t('legal.tou.section9.sub4.p1')}</p>

        <h2>10. {t('legal.tou.section10.title')}</h2>
        <p>{t('legal.tou.section10.p1')}</p>

        <h2>11. {t('legal.tou.section11.title')}</h2>
        <p>{t('legal.tou.section11.p1')}</p>
        <p>{t('legal.tou.section11.p2')}</p>

        <h2>12. {t('legal.tou.section12.title')}</h2>
        <p>{t('legal.tou.section12.p1')}</p>

        <h2>13. {t('legal.tou.section13.title')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('legal.tou.section13.p1') }} />

        <h2>14. {t('legal.tou.section14.title')}</h2>
        <p>{t('legal.tou.section14.p1')}</p>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>{t('legal.legalNote')}</strong>: {t('legal.legalNoteText')}
          </p>
        </div>
      </div>
    </div>
  )
}
