'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { GeneratedToken } from '@/lib/core/totp';

interface TotpCardProps {
  token: GeneratedToken;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export function TotpCard({ token, onDelete, showDelete = true }: TotpCardProps) {
  const t = useTranslations('manager.card');
  const tCommon = useTranslations('common');
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token.code);
      toast({
        title: tCommon('copied'),
        description: t('copiedDescription', { issuer: token.issuer }),
      });
    } catch {
      toast({
        title: tCommon('error'),
        description: tCommon('copyError'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(token.id);
      toast({
        title: t('deleted'),
        description: t('deletedDescription', { issuer: token.issuer }),
      });
    } catch {
      toast({
        title: tCommon('error'),
        description: t('deleteError'),
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  // Calculate progress percentage (0-100)
  const progress = (token.expiresIn / 30) * 100;

  // Determine color based on time remaining
  const getColorClass = () => {
    if (token.expiresIn <= 5) return 'text-red-400 border-red-500';
    if (token.expiresIn <= 10) return 'text-yellow-400 border-yellow-500';
    return 'text-blue-400 border-blue-500';
  };

  const getProgressColor = () => {
    if (token.expiresIn <= 5) return 'bg-red-500';
    if (token.expiresIn <= 10) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <Card
      className={`bg-gray-800 border-2 transition-all hover:shadow-lg cursor-pointer ${getColorClass()}`}
      onClick={handleCopy}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{token.issuer}</h3>
            <p className="text-gray-400 text-sm truncate">{token.label}</p>
          </div>
          {showDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-400 hover:bg-red-900/20 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          )}
        </div>

        {/* TOTP Code */}
        <div className="mb-3">
          <div className="text-4xl font-mono font-bold text-white tracking-wider flex items-center gap-2">
            <span>{token.code.slice(0, 3)}</span>
            <span className="text-gray-600">•</span>
            <span>{token.code.slice(3)}</span>
          </div>
        </div>

        {/* Progress Bar and Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{t('expiresIn')}</span>
            <span className={`font-mono font-bold ${getColorClass().split(' ')[0]}`}>
              {token.expiresIn}s
            </span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Copy Hint */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          {t('clickToCopy')}
        </div>
      </CardContent>
    </Card>
  );
}
