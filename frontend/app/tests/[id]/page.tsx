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
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [submitResult] = useSubmitResultMutation();

    const test = isOnline ? onlineTest : offlineTest;

    useEffect(() => {
        if (isOnline && onlineTest) {
            offlineDB.saveTests([onlineTest]);
        }
    }, [isOnline, onlineTest]);

    useEffect(() => {
        if (!isOnline) {
            offlineDB.getTestById(Number(id)).then(setOfflineTest);
        }
    }, [isOnline, id]);

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
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
            await submitResult({
                test_id: Number(id),
                score: finalScore,
                answers,
            }).unwrap();
        } else {
            await offlineDB.savePendingResult({
                test_id: Number(id),
                score: finalScore,
                answers,
                created_at: new Date().toISOString(),
            });
        }
    };

    if (isLoading && isOnline) return <div className="p-8">Loading...</div>;
    if (!test) return <div className="p-8">Test not available offline</div>;

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Result: {score}%</h1>
                {!isOnline && (
                    <p className="text-orange-500 mb-4">
                        You are offline. Result will sync when connection is restored.
                    </p>
                )}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-500 text-white px-6 py-2 rounded"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">{test.title}</h1>
                <span className={`text-sm ${isOnline ? 'text-green-500' : 'text-orange-500'}`}>
                    {isOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
            </div>

            <div className="flex flex-col gap-8">
                {test.questions.map((question, index) => (
                    <div key={question.id}>
                        <p className="font-medium mb-3">
                            {index + 1}. {question.text}
                        </p>
                        <div className="flex flex-col gap-2">
                            {question.options.map(option => (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(String(question.id), option)}
                                    className={`text-left p-3 rounded border ${answers[String(question.id)] === option
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== test.questions.length}
                className="mt-8 w-full bg-green-500 text-white p-3 rounded disabled:opacity-50"
            >
                Submit Test
            </button>
        </div>
    );
}