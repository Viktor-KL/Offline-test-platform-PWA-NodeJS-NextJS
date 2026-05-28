'use client'

import { store } from '@/store';
import { Provider } from 'react-redux';
import { AuthInitializer } from './components/AuthInitializer';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <AuthInitializer>{children}</AuthInitializer>
        </Provider>
    );
}