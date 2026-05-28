import { ServerResponse } from 'http'
import { AppRequest, Middleware } from './types'

type Handler = (req: AppRequest, res: ServerResponse) => void

interface Route {
    method: string,
    path: string,
    handler: Handler,
    middleware?: Middleware[]
}

const routes: Route[] = []

function matchPath(routePath: string, requestUrl: string): Record<string, string> | null {
    const routeParts = routePath.split('/')
    const urlParts = requestUrl.split('?')[0].split('/')

    if (routeParts.length !== urlParts.length) return null

    const params: Record<string, string> = {}

    for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
            params[routeParts[i].slice(1)] = urlParts[i]
        } else if (routeParts[i] !== urlParts[i]) {
            return null
        }
    }

    return params
}

export const router = {
    get(path: string, handler: Handler, ...middleware: Middleware[]) {
        routes.push({ method: 'GET', path, handler, middleware });
    },

    post(path: string, handler: Handler, ...middleware: Middleware[]) {
        routes.push({ method: 'POST', path, handler, middleware });
    },

    handle(req: AppRequest, res: ServerResponse) {
        for (const route of routes) {
            if (route.method !== req.method) continue

            const params = matchPath(route.path, req.url ?? '')

            if (params !== null) {
                req.params = params
            
                if (route.middleware && route.middleware.length > 0) {
                    let i = 0;
                    const next = () => {
                        if (i < route.middleware!.length) {
                            route.middleware![i++](req, res, next);
                        } else {
                            route.handler(req, res);
                        }
                    };
                    next();
                } else {
                    route.handler(req, res);
                }
            
                return;
            }
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
}