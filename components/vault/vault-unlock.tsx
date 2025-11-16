'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VaultUnlockProps {
  onUnlock: (password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  hasExistingVault?: boolean;
}

export function VaultUnlock({ onUnlock, isLoading = false, error, hasExistingVault = false }: VaultUnlockProps) {
  const t = useTranslations('manager.unlock');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!password) {
      setLocalError(t('validation.passwordRequired'));
      return;
    }

    if (password.length < 8) {
      setLocalError(t('validation.passwordMinLength'));
      return;
    }

    try {
      await onUnlock(password);
      setPassword(''); // Clear password on success
    } catch (err) {
      // Error is handled by parent component
      console.error('Unlock failed:', err);
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
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
          <CardTitle className="text-2xl text-white">
            {hasExistingVault ? t('title') : t('createVault')}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {hasExistingVault
              ? t('enterPasswordDesc')
              : t('createPasswordDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                {t('password')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-gray-500">
                {t('passwordHelp')}
              </p>
            </div>

            {displayError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                <AlertDescription className="text-red-400">
                  {displayError === 'INVALID_PASSWORD'
                    ? t('error')
                    : displayError}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || password.length < 8}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('unlocking')}
                </>
              ) : (
                t('unlockButton')
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-2">{t('securityNotes.title')}</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• {t('securityNotes.encryption')}</li>
              <li>• {t('securityNotes.pbkdf2')}</li>
              <li>• {t('securityNotes.storage')}</li>
              <li>• {t('securityNotes.warning')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
