import { ServerResponse } from 'http';
import { AppRequest } from '../types';
import { resultRepository } from '../repositories/resultRepository';
import { testRepository } from '../repositories/testRepository';

function sendJson(res: ServerResponse, status: number, data: unknown) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

export const resultController = {
    async create(req: AppRequest, res: ServerResponse) {
        try {
            const { test_id, answers } = req.body;
            const user_id = req.userId;

            if (!user_id || !test_id || !answers) {
                return sendJson(res, 400, { error: 'Missing required fields' });
            }

            const questions = await testRepository.findQuestionByTestId(test_id);
            if (!questions.length) {
                return sendJson(res, 404, { error: 'Test not found' });
            }

            let correct = 0;
            questions.forEach(q => {
                if (answers[String(q.id)] === q.correct_answer) correct++;
            });
            const score = Math.round((correct / questions.length) * 100);

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
