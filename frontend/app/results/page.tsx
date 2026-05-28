'use client';

import { useGetMyResultsQuery } from '@/store/api/resultsApi';
import Link from 'next/link';

export default function ResultsPage() {
    const { data: results, isLoading } = useGetMyResultsQuery();

    const avgScore = results && results.length > 0
        ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
        : 0;

    const best = results && results.length > 0
        ? Math.max(...results.map(r => r.score))
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

            {/* Header */}
            <header className="backdrop-blur-xl bg-white/60 border-b border-white/80 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-800">My Results</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Stats */}
                {results && results.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Average Score</p>
                            <p className={`text-3xl font-bold mt-1 ${avgScore >= 70 ? 'text-indigo-600' : 'text-orange-500'}`}>
                                {avgScore}%
                            </p>
                        </div>
                        <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Best Score</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{best}%</p>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="space-y-3">
                    {isLoading && (
                        <>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 rounded-2xl bg-white/40 animate-pulse" />
                            ))}
                        </>
                    )}

                    {!isLoading && !results?.length && (
                        <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-10 text-center">
                            <p className="text-4xl mb-3">📝</p>
                            <p className="text-gray-600 font-medium">No results yet</p>
                            <p className="text-gray-400 text-sm mt-1">Take a test to see your results here</p>
                            <Link
                                href="/dashboard"
                                className="inline-block mt-4 text-indigo-600 font-medium text-sm hover:text-indigo-700 transition-colors"
                            >
                                Browse tests →
                            </Link>
                        </div>
                    )}

                    {results?.map((result, index) => {
                        const isPassing = result.score >= 70;
                        return (
                            <div
                                key={result.id}
                                className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm flex items-center gap-4"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                                    isPassing ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
                                }`}>
                                    {isPassing ? '✓' : '✗'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-800">{result.test_title}</p>
                                        {result.synced_at === null && (
                                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                                Pending sync
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {new Date(result.created_at).toLocaleDateString('en-US', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-2xl font-bold ${isPassing ? 'text-indigo-600' : 'text-orange-500'}`}>
                                        {result.score}%
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
