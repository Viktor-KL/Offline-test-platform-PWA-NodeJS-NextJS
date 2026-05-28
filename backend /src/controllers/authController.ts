import { ServerResponse } from 'http';
import { AppRequest } from '../types';
import { authService } from '../services/authService';

function sendJson(res: ServerResponse, status: number, data: unknown) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

export const authController = {
    async register(req: AppRequest, res: ServerResponse) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return sendJson(res, 400, { error: 'Name, email and password are required' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return sendJson(res, 400, { error: 'Invalid email format' });
            }

            if (password.length < 6) {
                return sendJson(res, 400, { error: 'Password must be at least 6 characters' });
            }

            if (name.trim().length < 2 || name.trim().length > 50) {
                return sendJson(res, 400, { error: 'Name must be between 2 and 50 characters' });
            }

            const result = await authService.register(name.trim(), email.toLowerCase(), password);

            res.setHeader('Set-Cookie', [
                `refreshToken=${result.refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure; SameSite=Lax' : ''}`,
            ]);

            return sendJson(res, 201, {
                user: result.user,
                accessToken: result.accessToken,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            return sendJson(res, 400, { error: message });
        }
    },

    async login(req: AppRequest, res: ServerResponse) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return sendJson(res, 400, { error: 'Email and password are required' });
            }

            const result = await authService.login(email, password);

            res.setHeader('Set-Cookie', [
                `refreshToken=${result.refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure; SameSite=Lax' : ''}`,
            ]);

            return sendJson(res, 200, {
                user: result.user,
                accessToken: result.accessToken,
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Server error';
            return sendJson(res, 400, { error: message });
        }
    },

    async refresh(req: AppRequest, res: ServerResponse) {
        try {
            const cookies = req.headers.cookie || '';
            const refreshToken = cookies
                .split(';')
                .map(c => c.trim())
                .find(c => c.startsWith('refreshToken='))
                ?.split('=')[1];

            if (!refreshToken) {
                return sendJson(res, 401, { error: 'No refresh token' });
            }

            const result = await authService.refresh(refreshToken);
            return sendJson(res, 200, result);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Server error';
            return sendJson(res, 401, { error: message });
        }
    },

    async logout(req: AppRequest, res: ServerResponse) {
        res.setHeader('Set-Cookie', [
            'refreshToken=; HttpOnly; Path=/; Max-Age=0',
        ]);
        return sendJson(res, 200, { message: 'Logged out' });
    },
}