import { ServerResponse } from 'http';
import { AppRequest } from '../types';
import { resultRepository } from '../repositories/resultRepository';

function sendJson(res: ServerResponse, status: number, data: unknown) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

export const resultController = {
    async create(req: AppRequest, res: ServerResponse) {
        try {
            const { test_id, score, answers } = req.body;
            const user_id = req.userId;

            if (!user_id || !test_id || score === undefined || !answers) {
                return sendJson(res, 400, { error: 'Missing required fields' });
            }

            const result = await resultRepository.create({ user_id, test_id, score, answers });
            return sendJson(res, 201, result);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Server error';
            return sendJson(res, 500, { error: message });
        }
    },

    async getByUser(req: AppRequest, res: ServerResponse) {
        try {
            const user_id = req.userId!;
            const results = await resultRepository.findByUserId(user_id);
            return sendJson(res, 200, results);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Server error';
            return sendJson(res, 500, { error: message });
        }
    },
};
