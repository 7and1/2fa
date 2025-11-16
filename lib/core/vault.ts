import { VaultCrypto, MemoryFootprint, type EncryptionEnvelope } from './crypto';
import { randomBase32 } from './base32';
import type { HashAlgorithm } from './totp';

const STORAGE_KEY = 'twofa.vault';
const DEFAULT_PERSIST_DELAY_MS = 250;

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null | undefined;

type PersistStatus = 'idle' | 'queued' | 'saving' | 'error';

export interface VaultEntry {
  id: string;
  issuer: string;
  label: string;
  secret: string;
  digits: number;
  period: number;
  algorithm: HashAlgorithm;
  tags: string[];
  group: string | null;
  favorite: boolean;
  notes: string;
  lastUsed: string | null;
  useCount: number;
  createdAt: string;
  updatedAt: string;
  epoch?: number;
}

interface PersistStats {
  status: PersistStatus;
  pendingWrites: number;
  lastPersistDuration: number;
  lastPersistedAt: string | null;
  lastError: string | null;
  queuedAt: number | null;
}

export interface PersistState extends PersistStats {
  scheduled: boolean;
  inFlight: boolean;
}

export interface PersistOptions {
  immediate?: boolean;
}

export interface VaultServiceOptions {
  persistDelayMs?: number;
}

export interface ImportSuccess {
  status: 'ok';
  entry: VaultEntry;
}

export interface ImportFailure {
  status: 'failed';
  reason: string;
  input: unknown;
}

export type ImportResult = ImportSuccess | ImportFailure;

interface EnvelopeMeta {
  salt?: string;
  version?: number;
}

function nowIso(): string {
  return new Date().toISOString();
}

function toId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeEntry(partial: Partial<VaultEntry> & { secret: string }): VaultEntry {
  if (!partial?.secret) {
    throw new Error('Secret is required');
  }
  const entry: VaultEntry = {
    id: partial.id ?? toId(),
    issuer: (partial.issuer || 'Unknown').trim(),
    label: (partial.label || `Account-${randomBase32(6)}`).trim(),
    secret: partial.secret.replace(/\s+/g, '').toUpperCase(),
    digits: Number(partial.digits) || 6,
    period: Number(partial.period) || 30,
    algorithm: ((partial.algorithm as HashAlgorithm) || 'SHA-1').toUpperCase(),
    tags: Array.isArray(partial.tags) ? partial.tags : [],
    group: partial.group ?? null,
    favorite: Boolean(partial.favorite),
    notes: partial.notes || '',
    lastUsed: partial.lastUsed ?? null,
    useCount: partial.useCount ?? 0,
    createdAt: partial.createdAt ?? nowIso(),
    updatedAt: nowIso(),
    epoch: partial.epoch,
  };
  entry.digits = Math.min(10, Math.max(6, entry.digits));
  entry.period = Math.min(60, Math.max(15, entry.period));
  return entry;
}

function safeStorage(): StorageLike {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export class VaultService {
  #persistTimer: ReturnType<typeof setTimeout> | null = null;
  #pendingPersistPromise: Promise<void> | null = null;
  #pendingPersistResolve: (() => void) | null = null;
  #pendingPersistReject: ((reason?: unknown) => void) | null = null;
  #activePersistPromise: Promise<EncryptionEnvelope & { persistedAt: string }> | null = null;

  storage: StorageLike;
  crypto: VaultCrypto;
  entries: VaultEntry[] = [];
  masterPassword: string | null = null;
  lastPersistedAt: string | null = null;
  persistDelayMs: number;
  onPersistError: ((error: unknown) => void) | null = null;
  onPersistStateChange: ((state: PersistState) => void) | null = null;
  persistStats: PersistStats = {
    status: 'idle',
    pendingWrites: 0,
    lastPersistDuration: 0,
    lastPersistedAt: null,
    lastError: null,
    queuedAt: null,
  };

  constructor(storage: StorageLike = safeStorage(), crypto = new VaultCrypto(), options: VaultServiceOptions = {}) {
    this.storage = storage ?? null;
    this.crypto = crypto;
    this.persistDelayMs = options.persistDelayMs ?? DEFAULT_PERSIST_DELAY_MS;
  }

  isUnlocked(): boolean {
    return Boolean(this.masterPassword);
  }

  hasData(): boolean {
    this.#requireStorage();
    return Boolean(this.storage?.getItem(STORAGE_KEY));
  }

  getStats(): { count: number; lastPersistedAt: string | null; size: number } {
    return {
      count: this.entries.length,
      lastPersistedAt: this.lastPersistedAt,
      size: MemoryFootprint.estimateBytes(this.storage?.getItem(STORAGE_KEY) ?? ''),
    };
  }

  getEntries(): VaultEntry[] {
    return [...this.entries];
  }

  getPersistState(): PersistState {
    return {
      ...this.persistStats,
      scheduled: Boolean(this.#persistTimer),
      inFlight: Boolean(this.#activePersistPromise),
    };
  }

  async unlock(password: string): Promise<VaultEntry[]> {
    this.#requireStorage();
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    this.masterPassword = password;
    const stored = this.storage?.getItem(STORAGE_KEY);
    if (!stored) {
      this.entries = [];
      await this.persist({ immediate: true });
      return this.getEntries();
    }
    try {
      const envelope = JSON.parse(stored) as EncryptionEnvelope & { entries?: VaultEntry[]; persistedAt?: string };
      const payload = await this.crypto.decrypt<{ entries: VaultEntry[] }>(password, envelope);
      this.entries = payload.entries || [];
      this.lastPersistedAt = envelope.persistedAt ?? null;
      return this.getEntries();
    } catch {
      this.masterPassword = null;
      throw new Error('INVALID_PASSWORD');
    }
  }

  async lock(): Promise<void> {
    await this.flushPersist();
    this.masterPassword = null;
    this.entries = [];
  }

  async addEntry(partial: Partial<VaultEntry> & { secret: string }): Promise<VaultEntry> {
    this.#requireUnlocked();
    const entry = normalizeEntry(partial);
    this.#upsertEntry(entry);
    this.#queuePersist();
    return entry;
  }

  async removeEntry(id: string): Promise<void> {
    this.#requireUnlocked();
    const nextEntries = this.entries.filter((entry) => entry.id !== id);
    if (nextEntries.length === this.entries.length) {
      return;
    }
    this.entries = nextEntries;
    this.#queuePersist();
  }

  async importEntries(batch: Array<Partial<VaultEntry> & { secret?: string }> = []): Promise<ImportResult[]> {
    this.#requireUnlocked();
    const results: ImportResult[] = [];
    for (const partial of batch) {
      try {
        if (!partial.secret) {
          throw new Error('Secret is required');
        }
        const entry = normalizeEntry(partial as Partial<VaultEntry> & { secret: string });
        this.#upsertEntry(entry);
        results.push({ status: 'ok', entry });
      } catch (error) {
        results.push({ status: 'failed', reason: (error as Error).message, input: partial });
      }
    }
    this.#queuePersist();
    return results;
  }

  persist(options: PersistOptions = {}): Promise<void> {
    const { immediate = false } = options;
    if (immediate) {
      return this.#runImmediatePersist();
    }
    if (!this.isUnlocked()) {
      return Promise.reject(new Error('Vault locked'));
    }
    this.#requireStorage();
    if (!this.#pendingPersistPromise) {
      this.#pendingPersistPromise = new Promise((resolve, reject) => {
        this.#pendingPersistResolve = resolve;
        this.#pendingPersistReject = reject;
      });
    }
    this.persistStats.pendingWrites += 1;
    if (!this.persistStats.queuedAt) {
      this.persistStats.queuedAt = Date.now();
    }
    this.persistStats.status = this.#activePersistPromise ? 'saving' : 'queued';
    this.persistStats.lastError = null;
    this.#emitPersistState();
    if (!this.#persistTimer) {
      this.#persistTimer = setTimeout(() => {
        this.#runImmediatePersist().catch(() => {
          /* handled via #handlePersistError */
        });
      }, this.persistDelayMs);
    }
    return this.#pendingPersistPromise;
  }

  async clearAll(): Promise<void> {
    this.#requireStorage();
    if (this.isUnlocked()) {
      this.entries = [];
      await this.persist({ immediate: true });
    }
    this.storage?.removeItem(STORAGE_KEY);
    this.entries = [];
    this.masterPassword = null;
    this.lastPersistedAt = null;
    this.#cancelScheduledPersist();
  }

  async exportEncrypted(): Promise<string> {
    this.#requireUnlocked();
    this.#requireStorage();
    await this.flushPersist();
    const payload = this.storage?.getItem(STORAGE_KEY);
    if (!payload) {
      throw new Error('No data available for export');
    }
    return payload;
  }

  async restoreFromEnvelope(serializedEnvelope: string | EncryptionEnvelope): Promise<VaultEntry[]> {
    this.#requireUnlocked();
    this.#requireStorage();
    if (!serializedEnvelope) {
      throw new Error('Backup payload required');
    }
    let parsed: EncryptionEnvelope;
    try {
      parsed = typeof serializedEnvelope === 'string' ? JSON.parse(serializedEnvelope) : serializedEnvelope;
    } catch {
      throw new Error('Backup file is corrupted');
    }
    const payload = await this.crypto.decrypt<{ entries: VaultEntry[] }>(this.masterPassword!, parsed);
    if (!Array.isArray(payload.entries)) {
      throw new Error('Backup payload missing entries');
    }
    this.entries = payload.entries.map((entry) => normalizeEntry(entry));
    await this.persist({ immediate: true });
    return this.getEntries();
  }

  async addTagToEntry(entryId: string, tag: string): Promise<VaultEntry> {
    this.#requireUnlocked();
    const entry = this.entries.find((e) => e.id === entryId);
    if (!entry) throw new Error('Entry not found');
    if (!entry.tags.includes(tag)) {
      entry.tags.push(tag);
      entry.updatedAt = nowIso();
      this.#queuePersist();
    }
    return entry;
  }

  async removeTagFromEntry(entryId: string, tag: string): Promise<VaultEntry> {
    this.#requireUnlocked();
    const entry = this.entries.find((e) => e.id === entryId);
    if (!entry) throw new Error('Entry not found');
    const nextTags = entry.tags.filter((t) => t !== tag);
    if (nextTags.length === entry.tags.length) {
      return entry;
    }
    entry.tags = nextTags;
    entry.updatedAt = nowIso();
    this.#queuePersist();
    return entry;
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    this.entries.forEach((entry) => {
      entry.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  getEntriesByTag(tag: string): VaultEntry[] {
    return this.entries.filter((entry) => entry.tags.includes(tag));
  }

  async setGroup(entryId: string, group: string | null): Promise<VaultEntry> {
    this.#requireUnlocked();
    const entry = this.entries.find((e) => e.id === entryId);
    if (!entry) throw new Error('Entry not found');
    if (entry.group === group) {
      return entry;
    }
    entry.group = group;
    entry.updatedAt = nowIso();
    this.#queuePersist();
    return entry;
  }

  getAllGroups(): string[] {
    const groups = new Set<string>();
    this.entries.forEach((entry) => {
      if (entry.group) groups.add(entry.group);
    });
    return Array.from(groups).sort();
  }

  getEntriesByGroup(group: string | null): VaultEntry[] {
    return this.entries.filter((entry) => entry.group === group);
  }

  async toggleFavorite(entryId: string): Promise<VaultEntry> {
    this.#requireUnlocked();
    const entry = this.entries.find((e) => e.id === entryId);
    if (!entry) throw new Error('Entry not found');
    entry.favorite = !entry.favorite;
    entry.updatedAt = nowIso();
    this.#queuePersist();
    return entry;
  }

  getFavorites(): VaultEntry[] {
    return this.entries.filter((entry) => entry.favorite);
  }

  async incrementUseCount(entryId: string): Promise<VaultEntry> {
    const [entry] = await this.incrementUseCounts([entryId]);
    if (!entry) {
      throw new Error('Entry not found');
    }
    return entry;
  }

  async incrementUseCounts(entryIds: string[] = []): Promise<VaultEntry[]> {
    this.#requireUnlocked();
    const counts = entryIds.reduce<Map<string, number>>((map, id) => {
      if (!id) return map;
      const nextCount = (map.get(id) || 0) + 1;
      map.set(id, nextCount);
      return map;
    }, new Map());
    if (counts.size === 0) {
      return [];
    }
    const timestamp = nowIso();
    const updated: VaultEntry[] = [];
    counts.forEach((count, id) => {
      const entry = this.entries.find((e) => e.id === id);
      if (!entry) return;
      entry.useCount += count;
      entry.lastUsed = timestamp;
      entry.updatedAt = timestamp;
      updated.push(entry);
    });
    if (updated.length > 0) {
      this.#queuePersist();
    }
    return updated;
  }

  getRecentlyUsed(limit = 10): VaultEntry[] {
    return this.entries
      .filter((e) => e.lastUsed)
      .sort((a, b) => new Date(b.lastUsed ?? 0).getTime() - new Date(a.lastUsed ?? 0).getTime())
      .slice(0, limit);
  }

  getMostUsed(limit = 10): VaultEntry[] {
    return this.entries
      .filter((e) => e.useCount > 0)
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit);
  }

  async updateNotes(entryId: string, notes: string): Promise<VaultEntry> {
    this.#requireUnlocked();
    const entry = this.entries.find((e) => e.id === entryId);
    if (!entry) throw new Error('Entry not found');
    if (entry.notes === notes) {
      return entry;
    }
    entry.notes = notes;
    entry.updatedAt = nowIso();
    this.#queuePersist();
    return entry;
  }

  search(query: string, collection: VaultEntry[] = this.entries): VaultEntry[] {
    if (!query) {
      return [...collection];
    }
    const lowerQuery = query.toLowerCase();
    return collection.filter(
      (entry) =>
        entry.issuer.toLowerCase().includes(lowerQuery) ||
        entry.label.toLowerCase().includes(lowerQuery) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        (entry.group && entry.group.toLowerCase().includes(lowerQuery)) ||
        (entry.notes && entry.notes.toLowerCase().includes(lowerQuery)),
    );
  }

  async flushPersist(): Promise<void> {
    if (!this.isUnlocked()) {
      this.#cancelScheduledPersist();
      return;
    }
    if (this.#pendingPersistPromise || this.#persistTimer) {
      await this.persist({ immediate: true });
      return;
    }
    if (this.#activePersistPromise) {
      await this.#activePersistPromise;
    }
  }

  #queuePersist() {
    this.persist().catch(() => {
      /* handled elsewhere */
    });
  }

  async #runImmediatePersist(): Promise<void> {
    this.#requireUnlocked();
    this.#requireStorage();
    if (this.#persistTimer) {
      clearTimeout(this.#persistTimer);
      this.#persistTimer = null;
    }
    if (this.#activePersistPromise) {
      await this.#activePersistPromise;
      return;
    }
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.#emitPersistState({ status: 'saving' });
    this.#activePersistPromise = this.#writeEnvelope()
      .then((envelope) => {
        const endedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const duration = Math.max(0, endedAt - startedAt);
        this.persistStats.pendingWrites = 0;
        this.persistStats.queuedAt = null;
        this.persistStats.lastPersistDuration = duration;
        this.persistStats.lastPersistedAt = envelope.persistedAt;
        this.persistStats.status = 'idle';
        this.persistStats.lastError = null;
        this.#emitPersistState();
        this.#pendingPersistResolve?.();
        return envelope;
      })
      .catch((error) => {
        this.#pendingPersistReject?.(error);
        this.persistStats.lastError = (error as Error)?.message || String(error);
        this.persistStats.status = 'error';
        this.#emitPersistState();
        this.#handlePersistError(error);
        throw error;
      })
      .finally(() => {
        this.#pendingPersistPromise = null;
        this.#pendingPersistResolve = null;
        this.#pendingPersistReject = null;
        this.#activePersistPromise = null;
      });
    await this.#activePersistPromise;
  }

  async #writeEnvelope(): Promise<EncryptionEnvelope & { persistedAt: string }> {
    const envelope = await this.crypto.encrypt(
      this.masterPassword!,
      { entries: this.entries },
      this.#getEnvelopeMeta(),
    );
    envelope.persistedAt = nowIso();
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(envelope));
    this.lastPersistedAt = envelope.persistedAt;
    return envelope as EncryptionEnvelope & { persistedAt: string };
  }

  #cancelScheduledPersist() {
    if (this.#persistTimer) {
      clearTimeout(this.#persistTimer);
      this.#persistTimer = null;
    }
    this.#pendingPersistPromise = null;
    this.#pendingPersistResolve = null;
    this.#pendingPersistReject = null;
    this.persistStats.queuedAt = null;
    if (!this.#activePersistPromise) {
      this.persistStats.status = 'idle';
      this.#emitPersistState();
    }
  }

  #handlePersistError(error: unknown) {
    if (typeof this.onPersistError === 'function') {
      try {
        this.onPersistError(error);
      } catch (listenerError) {
        console.error('Vault persistence listener failed', listenerError);
      }
      return;
    }
    console.warn('Failed to persist encrypted vault', error);
  }

  #emitPersistState(patch?: Partial<PersistStats>) {
    if (patch) {
      Object.assign(this.persistStats, patch);
    }
    if (typeof this.onPersistStateChange === 'function') {
      this.onPersistStateChange(this.getPersistState());
    }
  }

  #getEnvelopeMeta(): EnvelopeMeta {
    if (!this.storage) return {};
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw) as Partial<EncryptionEnvelope>;
      return {
        salt: parsed.salt,
        version: parsed.version,
      };
    } catch {
      return {};
    }
  }

  #requireUnlocked() {
    if (!this.masterPassword) {
      throw new Error('Vault locked');
    }
  }

  #requireStorage() {
    if (!this.storage) {
      throw new Error('Secure storage is not available in this environment');
    }
  }

  #upsertEntry(entry: VaultEntry) {
    const index = this.entries.findIndex((item) => item.id === entry.id);
    if (index === -1) {
      this.entries.push(entry);
    } else {
      this.entries[index] = entry;
    }
  }
}
