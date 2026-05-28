'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetTestsQuery } from '@/store/api/testsApi';
import { useLogoutUserMutation } from '@/store/api/authApi';
import { useRouter } from 'next/navigation';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { offlineDB } from '@/lib/db';
import Link from 'next/link';

export default function DashboardPage() {
    const user = useAppSelector(state => state.auth.user);
    const { data: tests, isLoading } = useGetTestsQuery();
    const [logoutUser] = useLogoutUserMutation();
    const router = useRouter();
    const isOnline = useOnlineStatus();

    useEffect(() => {
        if (tests && tests.length > 0 && isOnline) {
            offlineDB.saveTests(tests.map(t => ({ ...t, questions: [] })));
        }
    }, [tests, isOnline]);

    const handleLogout = async () => {
        await logoutUser();
        router.push('/login');
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>

            <div className="flex justify-between items-center mb-8">
                <span className={`text-sm ${isOnline ? 'text-green-500' : 'text-orange-500'}`}>
                    {isOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
                <Link href="/results" className="text-blue-500 text-sm">
                    View my results
                </Link>
            </div>

            <h2 className="text-xl font-semibold mb-4">Available Tests</h2>
            {isLoading && <p>Loading...</p>}

            <div className="flex flex-col gap-3">
                {tests?.map(test => (
                    <Link
                        key={test.id}
                        href={`/tests/${test.id}`}
                        className="border p-4 rounded hover:bg-gray-50"
                    >
                        <h3 className="font-medium">{test.title}</h3>
                        <p className="text-gray-500 text-sm">{test.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}