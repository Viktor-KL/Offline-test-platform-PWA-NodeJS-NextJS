'use client';

import { useEffect, useState } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { offlineDB } from '@/lib/db';
import { useSubmitResultMutation } from '@/store/api/resultsApi';

export function useOfflineSync() {
    const isOnline = useOnlineStatus();
    const [submitResult] = useSubmitResultMutation();
    // Сколько офлайн-результатов успешно ушло в последнюю синхронизацию.
    // > 0 → показываем попап "снова онлайн".
    const [syncedCount, setSyncedCount] = useState(0);

    useEffect(() => {
        if (!isOnline) return;

        const sync = async () => {
            const pending = await offlineDB.getPendingResults();
            if (pending.length === 0) return;

            let synced = 0;
            for (const result of pending) {
                try {
                    await submitResult({
                        test_id: result.test_id,
                        answers: result.answers,
                    }).unwrap();

                    await offlineDB.markResultSynced(result.id);
                    synced++;
                } catch {
                    // будет повторная попытка при следующем подключении
                }
            }

            if (synced > 0) setSyncedCount(synced);
        };

        sync();
    }, [isOnline]);

    return {
        syncedCount,
        dismissSynced: () => setSyncedCount(0),
    };
}