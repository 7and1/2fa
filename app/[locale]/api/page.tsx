'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ApiPage() {
  const t = useTranslations('api');
  const navT = useTranslations('nav');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('h1')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">{t('intro')}</p>
        </div>

        {/* URL Format */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {t('urlFormat.title')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">{t('urlFormat.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm border border-gray-200 dark:border-gray-800">
              <code className="text-emerald-700 dark:text-green-400">{t('urlFormat.example')}</code>
            </div>
            <p className="text-gray-600 dark:text-gray-500 text-sm mt-3">{t('urlFormat.note')}</p>
          </CardContent>
        </Card>

        {/* Examples */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {t('examples.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium mb-2">{t('examples.basic')}</h4>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm mb-2 border border-gray-200 dark:border-gray-800">
                <a
                  href="https://2fa2fa.com/JBSWY3DPEHPK3PXP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline break-all"
                >
                  {t('examples.basicUrl')}
                </a>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('examples.basicDesc')}</p>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium mb-2">{t('examples.bookmark')}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('examples.bookmarkDesc')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('features.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="text-gray-900 dark:text-white font-medium mb-1">{t('features.instant')}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('features.instantDesc')}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="text-gray-900 dark:text-white font-medium mb-1">{t('features.secure')}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('features.secureDesc')}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="text-gray-900 dark:text-white font-medium mb-1">{t('features.noStorage')}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('features.noStorageDesc')}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="text-gray-900 dark:text-white font-medium mb-1">{t('features.offline')}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('features.offlineDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-8 bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {t('security.title')}
            </CardTitle>
            <CardDescription className="text-yellow-700/80 dark:text-yellow-300/80">{t('security.warning')}</CardDescription>
          </CardHeader>
          <CardContent>
            <h4 className="text-gray-900 dark:text-white font-medium mb-3">{t('security.tips.title')}</h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                {t('security.tips.tip1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                {t('security.tips.tip2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                {t('security.tips.tip3')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                {t('security.tips.tip4')}
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Try It */}
        <Card className="bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('tryIt.title')}
            </CardTitle>
            <CardDescription className="text-blue-700/80 dark:text-blue-300/80">{t('tryIt.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/JBSWY3DPEHPK3PXP" target="_blank" rel="noopener noreferrer">
                {t('tryIt.demoLink')}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Link href="/manager">
                {navT('manager')} →
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
