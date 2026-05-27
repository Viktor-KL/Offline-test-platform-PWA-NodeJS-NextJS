import { ServerResponse } from 'http';
import { AppRequest, Next } from '../types';

export const logger = (req: AppRequest, res: ServerResponse, next: Next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
}