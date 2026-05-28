'use client';

import { useEffect, useState } from 'react';
import { useRefreshMutation } from '@/store/api/authApi';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const [refresh] = useRefreshMutation();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        refresh().finally(() => setIsReady(true));
    }, []);

    if (!isReady) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <svg className="animate-spin w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
        </div>
    );

    return <>{children}</>;
}