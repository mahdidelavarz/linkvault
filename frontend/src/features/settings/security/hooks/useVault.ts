'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VaultService } from '@/features/settings/security/utils';
import { VaultSession } from '@/features/settings/security/utils/session';
import { useAuthStore } from '@/features/auth/store/authStore';
import { get } from '@/lib/http';

async function fetchVaultStatus(): Promise<{ isEnabled: boolean }> {
    return get('/vault/status');
}

export function useVault() {
    const user = useAuthStore(s => s.user);
    const userId = String(user?.id ?? '');
    const queryClient = useQueryClient();

    const [isUnlocked, setIsUnlocked] = useState<boolean>(VaultSession.isUnlocked());
    const [isLoading, setIsLoading] = useState(false);

    // Subscribe to VaultSession lock/unlock events
    useEffect(() => {
        const unsubscribe = VaultSession.subscribe(() => setIsUnlocked(VaultSession.isUnlocked()));
        return unsubscribe;
    }, []);

    const { data, refetch: refetchStatus } = useQuery({
        queryKey: ['vault-status'],
        queryFn: fetchVaultStatus,
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });

    const isEnabled = data?.isEnabled ?? false;

    const unlock = useCallback(async (pin: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            return await VaultService.unlock(pin, userId);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Dispatch a global event — the Header's PinModal listens and handles the PIN prompt.
    const requestUnlock = useCallback(() => {
        window.dispatchEvent(new CustomEvent('vault:unlock-requested'));
    }, []);

    const lock = useCallback(() => {
        VaultService.lock();
    }, []);

    const setup = useCallback(async (pin: string): Promise<string> => {
        setIsLoading(true);
        try {
            const mnemonic = await VaultService.setup(userId, pin);
            await refetchStatus();
            return mnemonic;
        } finally {
            setIsLoading(false);
        }
    }, [userId, refetchStatus]);

    const recover = useCallback(async (mnemonic: string, pin: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            return await VaultService.recover(mnemonic, userId, pin);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const disable = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            await VaultService.disable();
            await refetchStatus();
            // Wipe all cached data so decrypted values don't linger in the UI
            queryClient.clear();
        } finally {
            setIsLoading(false);
        }
    }, [refetchStatus, queryClient]);

    const encrypt = useCallback(async (
        module: string, recordId: string, fieldName: string, plaintext: string
    ): Promise<void> => {
        await VaultService.encryptAndSave(module, recordId, fieldName, plaintext);
    }, []);

    const decrypt = useCallback(async (
        module: string, recordId: string, fieldName: string
    ): Promise<string | null> => {
        return VaultService.loadAndDecrypt(module, recordId, fieldName);
    }, []);

    return {
        isEnabled,
        isUnlocked,
        isLoading,
        userId,
        unlock,
        requestUnlock,
        lock,
        setup,
        recover,
        disable,
        encrypt,
        decrypt,
    };
}
