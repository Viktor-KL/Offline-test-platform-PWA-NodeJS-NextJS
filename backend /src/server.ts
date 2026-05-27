import http, { ServerResponse } from 'http'
import { router } from './router';
import { logger } from './middleware/logger';
import { cors } from './middleware/cors';
import { bodyParser } from './middleware/bodyParser';
import { AppRequest, Middleware } from './types';
import { getPool } from './db/connection';

const PORT = 4000

function runMiddleware(
    middlewares: Middleware[],
    req: AppRequest,
    res: ServerResponse,
    final: () => void
) {
    let i = 0

    const next = () => {
        if (i < middlewares.length) {
            middlewares[i++](req, res, next)
        } else {
            final()
        }
    }

    next()
}

router.get('/api/health', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
})

const server = http.createServer((req: AppRequest, res) => {
    runMiddleware(
        [logger, cors, bodyParser],
        req,
        res,
        () => router.handle(req, res)
    )
})

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

getPool().query('SELECT 1').then(() => {
    console.log('Database connected');
}).catch((err) => {
    console.error('Database connection failed:', err.message);
});