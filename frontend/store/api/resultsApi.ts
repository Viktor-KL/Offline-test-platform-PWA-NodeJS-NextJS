import { baseApi } from './baseApi';

interface Result {
    id: number;
    user_id: number;
    test_id: number;
    test_title: string;
    score: number;
    answers: Record<string, string>;
    created_at: string;
    synced_at: string | null;
}

export const resultsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        submitResult: builder.mutation<Result, { test_id: number; score: number; answers: Record<string, string> }>({
            query: (body) => ({
                url: '/results',
                method: 'POST',
                body,
            }),
        }),

        getMyResults: builder.query<Result[], void>({
            query: () => '/results',
        }),
    }),
});

export const { useSubmitResultMutation, useGetMyResultsQuery } = resultsApi;