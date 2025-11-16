'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { VaultEntry } from '@/lib/core/vault';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (entry: Partial<VaultEntry> & { secret: string }) => Promise<VaultEntry>;
}

export function AddAccountDialog({ open, onOpenChange, onAdd }: AddAccountDialogProps) {
  const t = useTranslations('manager.addAccountDialog');
  const tCommon = useTranslations('common');
  const { toast } = useToast();

  // Manual entry state
  const [issuer, setIssuer] = useState('');
  const [label, setLabel] = useState('');
  const [secret, setSecret] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const resetForm = () => {
    setIssuer('');
    setLabel('');
    setSecret('');
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secret.trim()) {
      toast({
        title: tCommon('error'),
        description: t('validation.secretRequired'),
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);

    try {
      await onAdd({
        issuer: issuer.trim() || t('defaultIssuer'),
        label: label.trim() || t('defaultLabel'),
        secret: secret.trim(),
        digits: 6,
        period: 30,
        algorithm: 'SHA-1',
      });

      toast({
        title: tCommon('success'),
        description: t('success'),
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: error instanceof Error ? error.message : t('error'),
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('title')}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900">
            <TabsTrigger value="manual">{t('tabs.manual')}</TabsTrigger>
            <TabsTrigger value="qr" disabled>
              {t('tabs.qr')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issuer" className="text-gray-300">
                  {t('fields.issuer')}
                </Label>
                <Input
                  id="issuer"
                  type="text"
                  placeholder={t('fields.issuerPlaceholder')}
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="label" className="text-gray-300">
                  {t('fields.accountLabel')}
                </Label>
                <Input
                  id="label"
                  type="text"
                  placeholder={t('fields.accountLabelPlaceholder')}
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret" className="text-gray-300">
                  {t('fields.secret')} <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="secret"
                  type="text"
                  placeholder={t('fields.secretPlaceholder')}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value.replace(/\s/g, '').toUpperCase())}
                  className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 font-mono"
                  required
                />
                <p className="text-xs text-gray-500">
                  {t('fields.secretHelp')}
                </p>
              </div>

              <div className="bg-gray-900 p-3 rounded-lg">
                <p className="text-xs text-gray-400">
                  {t('advancedSettings')}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    onOpenChange(false);
                  }}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  disabled={isAdding}
                >
                  {tCommon('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isAdding || !secret.trim()}
                >
                  {isAdding ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      {t('adding')}
                    </>
                  ) : (
                    t('addButton')
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="qr" className="mt-4">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📷</div>
              <p className="text-gray-400">{t('qrComingSoon')}</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
