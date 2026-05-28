import { ServerResponse } from 'http';
import { AppRequest } from '../types';
import { testRepository } from '../repositories/testRepository';

function sendJson(res: ServerResponse, status: number, data: unknown) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

export const testController = {
    async getAll(req: AppRequest, res: ServerResponse) {
        try {
            const tests = await testRepository.findAll();
            return sendJson(res, 200, tests);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Server error';
            return sendJson(res, 500, { error: message });
        }
    },

    async getById(req: AppRequest, res: ServerResponse) {
        try {
            const id = Number(req.params?.id);
            if (isNaN(id)) {
                return sendJson(res, 400, { error: 'Invalid test id' });
            }

            const test = await testRepository.findById(id);
            if (!test) {
                return sendJson(res, 404, { error: 'Test not found' });
            }

            const questions = await testRepository.findQuestionByTestId(id);
            return sendJson(res, 200, { ...test, questions });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Server error';
            return sendJson(res, 500, { error: message });
        }
    },
};