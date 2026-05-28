import { ServerResponse } from 'http';
import { AppRequest, Next } from '../types';

const MAX_BODY_SIZE = 1024 * 1024; // 1MB

export const bodyParser = (req: AppRequest, res: ServerResponse, next: Next) => {
    let data = '';
    let size = 0;

    req.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BODY_SIZE) {
            res.writeHead(413, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Request body too large' }));
            return;
        }
        data += chunk.toString();
    });

    req.on('end', () => {
        if (data) {
            try {
                req.body = JSON.parse(data);
            } catch {
                req.body = {};
            }
        }
        next();
    });
}