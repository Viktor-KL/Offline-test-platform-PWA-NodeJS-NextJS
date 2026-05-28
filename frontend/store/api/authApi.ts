import { baseApi } from './baseApi';
import { setCredentials, logout } from '../slices/authSlice';

interface AuthResponse {
    user: { id: number; name: string; email: string };
    accessToken: string;
}

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation<AuthResponse, { name: string; email: string; password: string }>({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                body,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                dispatch(setCredentials(data));
            },
        }),

        login: builder.mutation<AuthResponse, { email: string; password: string }>({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                dispatch(setCredentials(data));
            },
        }),

        logoutUser: builder.mutation<void, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                await queryFulfilled;
                dispatch(logout());
            },
        }),
    }),
});

export const { useRegisterMutation, useLoginMutation, useLogoutUserMutation } = authApi;
