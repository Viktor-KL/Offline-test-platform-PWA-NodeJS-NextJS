'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetTestsQuery } from '@/store/api/testsApi';
import { useGetMyResultsQuery } from '@/store/api/resultsApi';
import { useLogoutUserMutation } from '@/store/api/authApi';
import { useRouter } from 'next/navigation';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { offlineDB } from '@/lib/db';
import Link from 'next/link';

export default function DashboardPage() {
    const user = useAppSelector(state => state.auth.user);
    const { data: tests, isLoading } = useGetTestsQuery();
    const { data: results } = useGetMyResultsQuery();
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

    const completedTests = results?.length ?? 0;
    const avgScore = results && results.length > 0
        ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

            {/* Header */}
            <header className="backdrop-blur-xl bg-white/60 border-b border-white/80 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <span className="font-semibold text-gray-800">TestApp</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/60"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:block">Sign out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                {/* Greeting */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                        Good day, {user?.name} 👋
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Ready to learn something new today?</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tests Completed</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{completedTests}</p>
                    </div>
                    <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg. Score</p>
                        <p className={`text-3xl font-bold mt-1 ${avgScore >= 70 ? 'text-indigo-600' : avgScore > 0 ? 'text-orange-500' : 'text-gray-800'}`}>
                            {avgScore > 0 ? `${avgScore}%` : '—'}
                        </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Available Tests</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{tests?.length ?? '—'}</p>
                    </div>
                </div>

                {/* Tests list */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Available Tests</h2>
                        <Link href="/results" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                            My results →
                        </Link>
                    </div>

                    {isLoading && (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 rounded-2xl bg-white/40 animate-pulse" />
                            ))}
                        </div>
                    )}

                    <div className="space-y-3">
                        {tests?.map((test, index) => (
                            <Link
                                key={test.id}
                                href={`/tests/${test.id}`}
                                className="group flex items-center gap-4 backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-200"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">{test.title}</h3>
                                    <p className="text-sm text-gray-500 truncate mt-0.5">{test.description}</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            {/* Mobile bottom nav */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-white/70 border-t border-white/80 px-6 py-3 flex justify-around">
                <button className="flex flex-col items-center gap-1 text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-xs font-medium">Home</span>
                </button>
                <Link href="/results" className="flex flex-col items-center gap-1 text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-xs font-medium">Results</span>
                </Link>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-xs font-medium">Sign out</span>
                </button>
            </nav>
        </div>
    );
}
