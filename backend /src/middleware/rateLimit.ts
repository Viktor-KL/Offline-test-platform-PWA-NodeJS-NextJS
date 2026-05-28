import { ServerResponse } from 'http';
import { AppRequest, Next } from '../types';

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
    const store = new Map<string, RateLimitRecord>();

    return (req: AppRequest, res: ServerResponse, next: Next) => {
        const ip =
            (req.headers['x-real-ip'] as string) ||
            req.socket.remoteAddress ||
            'unknown';

        const now = Date.now();
        const record = store.get(ip);

        if (!record || now > record.resetAt) {
            store.set(ip, { count: 1, resetAt: now + windowMs });
            return next();
        }

        if (record.count >= maxRequests) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Too many requests. Please try again later.' }));
            return;
        }

        record.count++;
        next();
    };
}

export const authRateLimit = createRateLimiter(10, 60 * 1000); // 10 запросов в минуту
