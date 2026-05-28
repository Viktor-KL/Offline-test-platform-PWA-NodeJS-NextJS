'use client';

import { useEffect, useState } from 'react';
import { useRefreshMutation } from '@/store/api/authApi';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const [refresh] = useRefreshMutation();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        refresh().finally(() => setIsReady(true));
    }, []);

    if (!isReady) return null;

    return <>{children}</>;
}