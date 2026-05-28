'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetTestByIdQuery } from '@/store/api/testsApi';
import { useSubmitResultMutation } from '@/store/api/resultsApi';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { offlineDB, CachedTest } from '@/lib/db';

export default function TestPage() {
    const { id } = useParams();
    const router = useRouter();
    const isOnline = useOnlineStatus();

    const { data: onlineTest, isLoading } = useGetTestByIdQuery(Number(id), {
        skip: !isOnline,
    });

    const [offlineTest, setOfflineTest] = useState<CachedTest | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animKey, setAnimKey] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [submitResult] = useSubmitResultMutation();

    const test = isOnline ? onlineTest : offlineTest;

    useEffect(() => {
        if (isOnline && onlineTest) offlineDB.saveTests([onlineTest]);
    }, [isOnline, onlineTest]);

    useEffect(() => {
        if (!isOnline) offlineDB.getTestById(Number(id)).then(setOfflineTest);
    }, [isOnline, id]);

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        if (!test) return;
        setCurrentIndex(i => i + 1);
        setAnimKey(k => k + 1);
    };

    const handleSubmit = async () => {
        if (!test) return;

        let correct = 0;
        test.questions.forEach(q => {
            if (answers[String(q.id)] === q.correct_answer) correct++;
        });

        const finalScore = Math.round((correct / test.questions.length) * 100);
        setScore(finalScore);
        setSubmitted(true);

        if (isOnline) {
            await submitResult({ test_id: Number(id), score: finalScore, answers }).unwrap();
        } else {
            await offlineDB.savePendingResult({
                test_id: Number(id),
                score: finalScore,
                answers,
                created_at: new Date().toISOString(),
            });
        }
    };

    if (isLoading && isOnline) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Loading test...</p>
                </div>
            </div>
        );
    }

    if (!test || test.questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-3xl p-8 text-center max-w-sm w-full">
                    <p className="text-4xl mb-3">📵</p>
                    <p className="text-gray-600 font-medium mb-1">Test not available offline</p>
                    <p className="text-gray-400 text-sm mb-4">Open this test while online to cache it</p>
                    <button onClick={() => router.push('/dashboard')} className="text-indigo-600 font-medium">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        const correct = test.questions.filter(q => answers[String(q.id)] === q.correct_answer).length;
        const isPassing = score >= 70;

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-3xl shadow-2xl shadow-indigo-100/50 p-8 max-w-md w-full text-center space-y-6 animate-question">

                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl ${isPassing ? 'bg-green-100' : 'bg-orange-100'}`}>
                        {isPassing ? '🎉' : '📚'}
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">{score}%</h1>
                        <p className={`text-sm font-medium mt-1 ${isPassing ? 'text-green-600' : 'text-orange-500'}`}>
                            {isPassing ? 'Great job!' : 'Keep practicing!'}
                        </p>
                    </div>

                    <div className="bg-white/60 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Correct answers</span>
                            <span className="font-medium text-gray-800">{correct} / {test.questions.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Test</span>
                            <span className="font-medium text-gray-800">{test.title}</span>
                        </div>
                    </div>

                    {!isOnline && (
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-sm text-orange-600">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                            </svg>
                            Result will sync when you're back online
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const question = test.questions[currentIndex];
    const isLast = currentIndex === test.questions.length - 1;
    const currentAnswer = answers[String(question.id)];
    const progress = ((currentIndex + 1) / test.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">

            {/* Header */}
            <header className="backdrop-blur-xl bg-white/60 border-b border-white/80 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">{test.title}</p>
                        <p className="text-sm font-semibold text-gray-800">
                            Question {currentIndex + 1} of {test.questions.length}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/60"
                        >
                            Exit
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Question */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <div key={animKey} className="animate-question space-y-6">

                        {/* Question card */}
                        <div className="backdrop-blur-xl bg-white/60 border border-white/80 rounded-3xl shadow-sm p-6 sm:p-8">
                            <p className="text-lg sm:text-xl font-semibold text-gray-800 leading-relaxed">
                                {question.text}
                            </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            {question.options.map((option, i) => {
                                const isSelected = currentAnswer === option;
                                const letters = ['A', 'B', 'C', 'D'];
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswer(String(question.id), option)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-200 scale-[1.01]'
                                                : 'backdrop-blur-xl bg-white/60 border-white/80 text-gray-700 hover:bg-white/80 hover:scale-[1.01] active:scale-[0.99]'
                                        }`}
                                    >
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors ${
                                            isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                                        }`}>
                                            {letters[i]}
                                        </span>
                                        <span className="font-medium">{option}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-5 py-3 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-xl text-gray-600 font-medium hover:bg-white/80 transition-all duration-200 text-sm"
                            >
                                Exit test
                            </button>
                            <button
                                onClick={isLast ? handleSubmit : handleNext}
                                disabled={!currentAnswer}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                            >
                                {isLast ? 'Complete test' : 'Next question →'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
