import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Offline — QuizApp',
};

// Эту страницу @ducanh2912/next-pwa прекэширует и отдаёт как fallback,
// если навигация не нашлась ни в кэше, ни в сети. Держим её статической
// и без зависимостей от сети/стора, чтобы она гарантированно работала офлайн.
export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-3xl shadow-2xl shadow-indigo-100/50 p-8 max-w-sm w-full text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-orange-100 mx-auto flex items-center justify-center text-3xl">
                    📡
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">You&apos;re offline</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        This page isn&apos;t cached yet. Tests you opened while online are still
                        available — head back and pick one.
                    </p>
                </div>
                <a
                    href="/dashboard"
                    className="block w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium shadow-lg shadow-indigo-200"
                >
                    Back to Dashboard
                </a>
            </div>
        </div>
    );
}
