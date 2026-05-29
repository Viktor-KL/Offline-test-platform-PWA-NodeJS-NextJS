'use client';

interface SyncedPopupProps {
    count: number;
    onClose: () => void;
}

export function SyncedPopup({ count, onClose }: SyncedPopupProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-question">
            <div className="backdrop-blur-xl bg-white/80 border border-white/80 rounded-3xl shadow-2xl shadow-indigo-100/50 p-8 max-w-sm w-full text-center space-y-5">
                <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">You&apos;re back online</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {count === 1
                            ? 'Your offline result has been saved and scored.'
                            : `${count} offline results have been saved and scored.`}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
