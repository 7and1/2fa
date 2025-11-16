'use client';

import { useState, useRef } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface BackupManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => Promise<string>;
  onImport: (backup: string) => Promise<void>;
  accountCount: number;
}

export function BackupManager({
  open,
  onOpenChange,
  onExport,
  onImport,
  accountCount
}: BackupManagerProps) {
  const t = useTranslations('manager.backup');
  const tCommon = useTranslations('common');
  const { toast } = useToast();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export backup as JSON file
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backup = await onExport();

      // Create download
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `2fa-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Backup exported',
        description: `${accountCount} accounts exported successfully`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export backup',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import backup from file
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();

      // Validate JSON
      try {
        JSON.parse(text);
      } catch {
        throw new Error('Invalid backup file: not valid JSON');
      }

      await onImport(text);

      toast({
        title: 'Backup restored',
        description: 'Your vault has been restored successfully',
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import backup',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t('title')}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {t('dialogDescription')}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900">
              <TabsTrigger value="export">{t('export')}</TabsTrigger>
              <TabsTrigger value="import">{t('import')}</TabsTrigger>
            </TabsList>

            {/* Export Tab */}
            <TabsContent value="export" className="mt-4 space-y-4">
              <Alert className="bg-blue-900/20 border-blue-500/50">
                <svg
                  className="h-4 w-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <AlertTitle className="text-blue-300 ml-2">{t('exportInfo.title')}</AlertTitle>
                <AlertDescription className="text-blue-200/80 ml-2">
                  {t('exportInfo.description')}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{t('stats.totalAccounts')}</span>
                  <span className="text-xl font-bold text-white">{accountCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{t('stats.encryption')}</span>
                  <span className="text-sm font-medium text-green-400">{t('stats.encryptionValue')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{t('stats.format')}</span>
                  <span className="text-sm font-medium text-gray-300">{t('stats.formatValue')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">{t('included.title')}</h4>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>{t('included.secrets')}</li>
                  <li>{t('included.names')}</li>
                  <li>{t('included.tags')}</li>
                  <li>{t('included.favorites')}</li>
                </ul>
              </div>

              <Button
                onClick={handleExport}
                disabled={isExporting || accountCount === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? (
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Backup File
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Import Tab */}
            <TabsContent value="import" className="mt-4 space-y-4">
              <Alert className="bg-yellow-900/20 border-yellow-500/50">
                <svg
                  className="h-4 w-4 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <AlertTitle className="text-yellow-300 ml-2">{tCommon('warning')}</AlertTitle>
                <AlertDescription className="text-yellow-200/80 ml-2">
                  {t('warning')}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-900 p-4 rounded-lg space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Requirements:</h4>
                <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                  <li>Valid backup file (.json)</li>
                  <li>Created with the same master password</li>
                  <li>Exported from this application</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-file" className="text-gray-300">
                  Select Backup File
                </Label>
                <Input
                  ref={fileInputRef}
                  id="backup-file"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  disabled={isImporting}
                  className="hidden"
                />
                <Button
                  onClick={handleImportClick}
                  disabled={isImporting}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {isImporting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Importing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Choose File
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  The backup file will be decrypted using your current master password.
                  Make sure you&apos;re using the same password that was used to create the backup.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
