import http, { ServerResponse } from 'http'
import { router } from './router';
import { logger } from './middleware/logger';
import { cors } from './middleware/cors';
import { bodyParser } from './middleware/bodyParser';
import { AppRequest, Middleware } from './types';
import { getPool } from './db/connection';
import { authController } from './controllers/authController';
import { testController } from './controllers/testController';
import { authMiddleware } from './middleware/auth';
import { resultController } from './controllers/resultController';
import { authRateLimit } from './middleware/rateLimit';

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

router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);
router.post('/api/auth/refresh', authController.refresh);
router.post('/api/auth/logout', authController.logout);
router.get('/api/tests', testController.getAll, authMiddleware);
router.get('/api/tests/:id', testController.getById, authMiddleware);
router.post('/api/results', resultController.create, authMiddleware);
router.get('/api/results', resultController.getByUser, authMiddleware);

const server = http.createServer((req: AppRequest, res) => {
    const middlewares: Middleware[] = [logger, cors, bodyParser];

    if (req.url?.startsWith('/api/auth/')) {
        middlewares.push(authRateLimit);
    }

    runMiddleware(middlewares, req, res, () => router.handle(req, res));
})

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

getPool().query('SELECT 1').then(() => {
    console.log('Database connected');
}).catch((err) => {
    console.error('Database connection failed:', err.message);
});