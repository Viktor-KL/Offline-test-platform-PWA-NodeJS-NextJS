import { IncomingMessage, ServerResponse } from 'http';

export interface AppRequest extends IncomingMessage {
    body?: any;
    params?: Record<string, string>;
}

export type Next = () => void

export type Middleware = (
    req: AppRequest,
    res: ServerResponse,
    next: Next
) => void