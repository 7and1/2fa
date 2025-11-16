'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Header() {
  const pathname = usePathname();
  const t = useTranslations('app');
  const navT = useTranslations('nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname === `/zh${path}`;
  };

  // Get current path without locale prefix
  const getCurrentPath = () => {
    if (pathname.startsWith('/zh')) {
      return pathname.slice(3) || '/';
    }
    return pathname;
  };

  // Language switch handlers
  const switchToEnglish = () => {
    const currentPath = getCurrentPath();
    window.location.href = currentPath;
  };

  const switchToChinese = () => {
    const currentPath = getCurrentPath();
    window.location.href = `/zh${currentPath}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-gray-900/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <svg
                className="h-8 w-8 relative text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg leading-none">
                {t('name')}
              </span>
              <span className="text-xs text-gray-400 leading-none mt-0.5">
                {t('tagline')}
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/') || isActive('/live')
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {navT('live')}
              </span>
            </Link>
            <Link
              href="/manager"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/manager')
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {navT('manager')}
              </span>
            </Link>
          </nav>

          {/* Theme & Language Switcher */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-1 bg-gray-800 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={switchToEnglish}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  !pathname.startsWith('/zh')
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={switchToChinese}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  pathname.startsWith('/zh')
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                中文
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/') || isActive('/live')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {navT('live')}
                </span>
              </Link>
              <Link
                href="/manager"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/manager')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {navT('manager')}
                </span>
              </Link>

              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="px-4 py-2">
                  <ThemeToggle />
                </div>
                <div className="flex items-center gap-2 px-4 py-2">
                  <button
                    onClick={() => {
                      switchToEnglish();
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all text-center cursor-pointer ${
                      !pathname.startsWith('/zh')
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white bg-gray-800'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => {
                      switchToChinese();
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all text-center cursor-pointer ${
                      pathname.startsWith('/zh')
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white bg-gray-800'
                    }`}
                  >
                    中文
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
