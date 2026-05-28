'use client'

import { store } from '@/store';
import { Provider } from 'react-redux';
import { AuthInitializer } from './components/AuthInitializer';
import { useOfflineSync } from '@/hooks/useOfflineSync';

function SyncManager({ children }: { children: React.ReactNode }) {
    useOfflineSync();
    return <>{children}</>;
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