import { ServerResponse } from 'http';
import { AppRequest, Next } from '../types';

export const bodyParser = (req: AppRequest, res: ServerResponse, next: Next) => {
    let data = ''

    req.on('data', (chunk) => {
        data += chunk.toString()
    })

    req.on('end', () => {
        if (data) {
            try {
                req.body = JSON.parse(data)
            } catch {
                req.body = {}
            }
        }
        next()
    })
}