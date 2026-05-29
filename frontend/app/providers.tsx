'use client'

import { store } from '@/store';
import { Provider } from 'react-redux';
import { AuthInitializer } from './components/AuthInitializer';
import { SyncedPopup } from './components/SyncedPopup';
import { useOfflineSync } from '@/hooks/useOfflineSync';

function SyncManager({ children }: { children: React.ReactNode }) {
    const { syncedCount, dismissSynced } = useOfflineSync();
    return (
        <>
            {children}
            {syncedCount > 0 && <SyncedPopup count={syncedCount} onClose={dismissSynced} />}
        </>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <AuthInitializer>
                <SyncManager>{children}</SyncManager>
            </AuthInitializer>
        </Provider>
    );
}