import { ServerResponse } from 'http';
import { AppRequest, Next } from '../types';

export const cors = (req: AppRequest, res: ServerResponse, next: Next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return;
    }

    next()
}