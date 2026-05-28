import { baseApi } from './baseApi';

interface Test {
    id: number;
    title: string;
    description: string;
    created_at: string;
}

interface Question {
    id: number;
    test_id: number;
    text: string;
    options: string[];
}

interface TestWithQuestions extends Test {
    questions: Question[];
}

export const testsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTests: builder.query<Test[], void>({
            query: () => '/tests',
        }),

        getTestById: builder.query<TestWithQuestions, number>({
            query: (id) => `/tests/${id}`,
        }),
    }),
});

export const { useGetTestsQuery, useGetTestByIdQuery } = testsApi;