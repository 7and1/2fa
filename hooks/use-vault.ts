'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VaultService, type VaultEntry, type ImportResult } from '@/lib/core/vault';
import { generateBatch, type GeneratedToken } from '@/lib/core/totp';

export interface VaultState {
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  entries: VaultEntry[];
  codes: GeneratedToken[];
  stats: {
    count: number;
    lastPersistedAt: string | null;
    size: number;
  };
}

export interface VaultActions {
  unlock: (password: string) => Promise<void>;
  lock: () => Promise<void>;
  addEntry: (entry: Partial<VaultEntry> & { secret: string }) => Promise<VaultEntry>;
  removeEntry: (id: string) => Promise<void>;
  importEntries: (batch: Array<Partial<VaultEntry> & { secret?: string }>) => Promise<ImportResult[]>;
  exportBackup: () => Promise<string>;
  restoreBackup: (backup: string) => Promise<void>;
  clearError: () => void;
  refreshCodes: () => Promise<void>;
}

export function useVault(): VaultState & VaultActions {
  const vaultRef = useRef<VaultService | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<VaultState>({
    isUnlocked: false,
    isLoading: false,
    error: null,
    entries: [],
    codes: [],
    stats: {
      count: 0,
      lastPersistedAt: null,
      size: 0,
    },
  });

  // Initialize vault service
  useEffect(() => {
    if (typeof window !== 'undefined') {
      vaultRef.current = new VaultService();
    }

    return () => {
      // Cleanup on unmount
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Refresh TOTP codes
  const refreshCodes = useCallback(async () => {
    if (!vaultRef.current || !state.isUnlocked || state.entries.length === 0) {
      return;
    }

    try {
      const codes = await generateBatch(state.entries);
      setState((prev) => ({ ...prev, codes }));
    } catch (error) {
      console.error('Failed to refresh codes:', error);
    }
  }, [state.isUnlocked, state.entries]);

  // Auto-refresh codes every second when unlocked
  useEffect(() => {
    if (state.isUnlocked && state.entries.length > 0) {
      refreshCodes();
      refreshIntervalRef.current = setInterval(refreshCodes, 1000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.isUnlocked, state.entries, refreshCodes]);

  // Unlock vault
  const unlock = useCallback(async (password: string) => {
    if (!vaultRef.current) {
      throw new Error('Vault not initialized');
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const entries = await vaultRef.current.unlock(password);
      const stats = vaultRef.current.getStats();

      setState((prev) => ({
        ...prev,
        isUnlocked: true,
        isLoading: false,
        entries,
        stats,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isUnlocked: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to unlock vault',
      }));
      throw error;
    }
  }, []);

  // Lock vault
  const lock = useCallback(async () => {
    if (!vaultRef.current) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await vaultRef.current.lock();

      setState({
        isUnlocked: false,
        isLoading: false,
        error: null,
        entries: [],
        codes: [],
        stats: {
          count: 0,
          lastPersistedAt: null,
          size: 0,
        },
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to lock vault',
      }));
    }
  }, []);

  // Add entry
  const addEntry = useCallback(
    async (entry: Partial<VaultEntry> & { secret: string }) => {
      if (!vaultRef.current) {
        throw new Error('Vault not initialized');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const newEntry = await vaultRef.current.addEntry(entry);
        const entries = vaultRef.current.getEntries();
        const stats = vaultRef.current.getStats();

        setState((prev) => ({
          ...prev,
          entries,
          stats,
          isLoading: false,
        }));

        return newEntry;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to add entry',
        }));
        throw error;
      }
    },
    []
  );

  // Remove entry
  const removeEntry = useCallback(async (id: string) => {
    if (!vaultRef.current) {
      throw new Error('Vault not initialized');
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await vaultRef.current.removeEntry(id);
      const entries = vaultRef.current.getEntries();
      const stats = vaultRef.current.getStats();

      setState((prev) => ({
        ...prev,
        entries,
        stats,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to remove entry',
      }));
      throw error;
    }
  }, []);

  // Import entries
  const importEntries = useCallback(
    async (batch: Array<Partial<VaultEntry> & { secret?: string }>) => {
      if (!vaultRef.current) {
        throw new Error('Vault not initialized');
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const results = await vaultRef.current.importEntries(batch);
        const entries = vaultRef.current.getEntries();
        const stats = vaultRef.current.getStats();

        setState((prev) => ({
          ...prev,
          entries,
          stats,
          isLoading: false,
        }));

        return results;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to import entries',
        }));
        throw error;
      }
    },
    []
  );

  // Export backup
  const exportBackup = useCallback(async () => {
    if (!vaultRef.current) {
      throw new Error('Vault not initialized');
    }

    try {
      const backup = await vaultRef.current.exportEncrypted();
      return backup;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export backup',
      }));
      throw error;
    }
  }, []);

  // Restore backup
  const restoreBackup = useCallback(async (backup: string) => {
    if (!vaultRef.current) {
      throw new Error('Vault not initialized');
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const entries = await vaultRef.current.restoreFromEnvelope(backup);
      const stats = vaultRef.current.getStats();

      setState((prev) => ({
        ...prev,
        entries,
        stats,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to restore backup',
      }));
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    unlock,
    lock,
    addEntry,
    removeEntry,
    importEntries,
    exportBackup,
    restoreBackup,
    clearError,
    refreshCodes,
  };
}
