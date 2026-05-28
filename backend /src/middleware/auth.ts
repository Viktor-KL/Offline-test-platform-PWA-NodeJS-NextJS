import jwt from 'jsonwebtoken';
import { ServerResponse } from 'http';
import { AppRequest, Next } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const authMiddleware = (req: AppRequest, res: ServerResponse, next: Next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
        req.userId = payload.userId;
        next();
    } catch {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid or expired token' }));
    }
};