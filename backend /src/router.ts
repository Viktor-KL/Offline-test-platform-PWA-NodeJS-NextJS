import { IncomingMessage, ServerResponse } from 'http'

type Handler = (req: IncomingMessage, res: ServerResponse) => void

interface Route {
    method: string,
    path: string,
    handler: Handler
}

const routes: Route[] = []

export const router = {
    get(path: string, handler: Handler) {
        routes.push({ method: 'GET', path, handler })
    },

    post(path: string, handler: Handler) {
        routes.push({ method: 'POST', path, handler });
    },

    hanlde(req: IncomingMessage, res: ServerResponse) {
        const route = routes.find(
            (r) => r.method === req.method && r.path === req.url
        )

        if (route) {
            route.handler(req, res)
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Route not found' }));
        }
    }
}