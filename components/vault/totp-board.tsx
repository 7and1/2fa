'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TotpCard } from './totp-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { GeneratedToken } from '@/lib/core/totp';

interface TotpBoardProps {
  codes: GeneratedToken[];
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export function TotpBoard({ codes, onDelete, showDelete = true }: TotpBoardProps) {
  const t = useTranslations('manager.board');
  const tCommon = useTranslations('common');
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopyAll = async () => {
    if (codes.length === 0) return;

    try {
      const allCodes = filteredCodes
        .map((token) => `${token.issuer}\t${token.label}\t${token.code}`)
        .join('\n');

      await navigator.clipboard.writeText(allCodes);
      toast({
        title: tCommon('copied'),
        description: t('copiedCount', { count: filteredCodes.length }),
      });
    } catch {
      toast({
        title: tCommon('error'),
        description: tCommon('copyError'),
        variant: 'destructive',
      });
    }
  };

  // Filter codes based on search query
  const filteredCodes = codes.filter((token) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      token.issuer.toLowerCase().includes(query) ||
      token.label.toLowerCase().includes(query)
    );
  });

  // Empty state
  if (codes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No accounts yet</h3>
        <p className="text-gray-400 mb-6">
          Add your first account to start generating TOTP codes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={handleCopyAll}
            variant="outline"
            className="flex-1 sm:flex-none border-gray-700 text-gray-300 hover:bg-gray-800"
            disabled={filteredCodes.length === 0}
          >
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
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy All ({filteredCodes.length})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span>
          Showing <span className="text-white font-semibold">{filteredCodes.length}</span> of{' '}
          <span className="text-white font-semibold">{codes.length}</span> accounts
        </span>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
          >
            Clear search
          </Button>
        )}
      </div>

      {/* No results */}
      {filteredCodes.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No accounts found matching &quot;{searchQuery}&quot;</div>
          <Button
            variant="ghost"
            onClick={() => setSearchQuery('')}
            className="text-blue-400 hover:text-blue-300"
          >
            Clear search
          </Button>
        </div>
      )}

      {/* TOTP Cards Grid */}
      {filteredCodes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCodes.map((token) => (
            <TotpCard
              key={token.id}
              token={token}
              onDelete={onDelete}
              showDelete={showDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
