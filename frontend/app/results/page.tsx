'use client';

import { useGetMyResultsQuery } from '@/store/api/resultsApi';
import Link from 'next/link';

export default function ResultsPage() {
    const { data: results, isLoading } = useGetMyResultsQuery();

    if (isLoading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">My Results</h1>
                <Link href="/dashboard" className="text-blue-500">
                    Back to Dashboard
                </Link>
            </div>

            {!results?.length && (
                <p className="text-gray-500">No results yet. Take a test first!</p>
            )}

            <div className="flex flex-col gap-4">
                {results?.map(result => (
                    <div key={result.id} className="border p-4 rounded">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Test #{result.test_id}</span>
                            <span className={`font-bold text-lg ${result.score >= 70 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {result.score}%
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            {new Date(result.created_at).toLocaleDateString()}
                        </p>
                        {result.synced_at === null && (
                            <span className="text-xs text-orange-500">Not synced</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}