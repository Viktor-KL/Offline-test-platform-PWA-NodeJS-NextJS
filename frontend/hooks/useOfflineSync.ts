'use client';

import { useEffect } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { offlineDB } from '@/lib/db';
import { useSubmitResultMutation } from '@/store/api/resultsApi';

export function useOfflineSync() {
    const isOnline = useOnlineStatus();
    const [submitResult] = useSubmitResultMutation();

    useEffect(() => {
        if (!isOnline) return;

        const sync = async () => {
            const pending = await offlineDB.getPendingResults();
            if (pending.length === 0) return;

            console.log(`Syncing ${pending.length} offline results...`);

            for (const result of pending) {
                try {
                    await submitResult({
                        test_id: result.test_id,
                        score: result.score,
                        answers: result.answers,
                    }).unwrap();

                    await offlineDB.markResultSynced(result.id);
                    console.log(`Result ${result.id} synced`);
                } catch (err) {
                    console.error(`Failed to sync result ${result.id}`, err);
                }
            }
        };

        sync();
    }, [isOnline]);
}