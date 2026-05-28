'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetTestByIdQuery } from '@/store/api/testsApi';
import { useAppSelector } from '@/store/hooks';
import { useSubmitResultMutation } from '@/store/api/resultsApi';

export default function TestPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: test, isLoading } = useGetTestByIdQuery(Number(id));
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [submitResult] = useSubmitResultMutation();

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }))
    }

    const handleSubmit = async () => {
        if (!test) return;

        let correct = 0;
        test.questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) correct++;
        });

        const finalScore = Math.round((correct / test.questions.length) * 100);
        setScore(finalScore);
        setSubmitted(true);

        await submitResult({ test_id: Number(id), score: finalScore, answers }).unwrap();
    };

    if (isLoading) return <div className="p-8">Loading...</div>
    if (!test) return <div className="p-8">Test not found</div>

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Result: {score}%</h1>
                <p className="text-gray-500 mb-8">
                    You answered {test.questions.filter(q => answers[q.id] === q.correct_answer).length} out of {test.questions.length} correctly
                </p>
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
            <h1 className="text-2xl font-bold mb-8">{test.title}</h1>

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