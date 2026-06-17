'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useVault } from '@/features/settings/security/hooks/useVault';
import { VaultService } from '@/features/settings/security/utils';
import { get, put } from '@/lib/http';

interface PlaintextItem {
  module: 'infrastructure' | 'link';
  id: number;
  name: string;
  content: string;
}

export function useVaultMigration() {
  const { isEnabled, isUnlocked } = useVault();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<PlaintextItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const prevUnlockedRef = useRef(false);

  const checkForPlaintext = useCallback(async () => {
    const found: PlaintextItem[] = [];

    try {
      const res = await get<any>('/infrastructure', { infraType: 'env', limit: 200 });
      for (const item of res?.items ?? []) {
        if (item.content && item.content !== 'vault:encrypted') {
          found.push({ module: 'infrastructure', id: item.id, name: item.title, content: item.content });
        }
      }
    } catch {}

    try {
      const res = await get<any>('/links', { limit: 500, page: 1 });
      for (const link of res?.items ?? []) {
        if (link.passwordEncrypted && link.passwordEncrypted !== 'vault:encrypted') {
          found.push({ module: 'link', id: link.id, name: link.title, content: link.passwordEncrypted });
        }
      }
    } catch {}

    if (found.length > 0) {
      setItems(found);
      setShowModal(true);
    }
  }, []);

  useEffect(() => {
    if (isEnabled && isUnlocked && !prevUnlockedRef.current) {
      prevUnlockedRef.current = true;
      checkForPlaintext();
    } else if (!isUnlocked) {
      prevUnlockedRef.current = false;
    }
  }, [isEnabled, isUnlocked, checkForPlaintext]);

  const encryptAll = useCallback(async () => {
    setProgress({ done: 0, total: items.length });
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const fieldName = item.module === 'infrastructure' ? 'content' : 'password';
        await VaultService.encryptAndSave(item.module, String(item.id), fieldName, item.content);

        // Verify the value round-trips with the current session key BEFORE replacing the
        // plaintext with the sentinel — otherwise a failed/mismatched write would leave the
        // field permanently undecryptable ("(not set)") with no plaintext to fall back on.
        const verified = await VaultService.loadAndDecrypt(item.module, String(item.id), fieldName);
        if (verified !== item.content) {
          // Leave the plaintext untouched; this item stays pending for a later attempt.
          setProgress({ done: i + 1, total: items.length });
          continue;
        }

        const route = item.module === 'infrastructure'
          ? `/infrastructure/${item.id}`
          : `/links/${item.id}`;
        const clearPayload = item.module === 'infrastructure'
          ? { content: 'vault:encrypted' }
          : { password: 'vault:encrypted' };
        await put(route, clearPayload);
      } catch {}
      setProgress({ done: i + 1, total: items.length });
    }
    setShowModal(false);
    setProgress(null);
    setItems([]);
    // Invalidate so cards refetch with the sentinel value and switch to vault-protected display
    queryClient.invalidateQueries({ queryKey: ['links'] });
    queryClient.invalidateQueries({ queryKey: ['infrastructure'] });
  }, [items, queryClient]);

  const dismiss = useCallback(() => {
    setShowModal(false);
  }, []);

  return { showModal, items, progress, encryptAll, dismiss };
}
