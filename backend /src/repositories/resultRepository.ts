import { getPool } from '../db/connection';
import { Result, CreateResultDto } from '../models/Result';

export const resultRepository = {
    async create(data: CreateResultDto): Promise<Result> {
        const pool = getPool();
        const result = await pool.query(
            'INSERT INTO results (user_id, test_id, score, answers) VALUES ($1, $2, $3, $4) RETURNING *',
            [data.user_id, data.test_id, data.score, JSON.stringify(data.answers)]
        );
        return result.rows[0];
    },

    async findByUserId(userId: number): Promise<Result[]> {
        const pool = getPool();
        const result = await pool.query(
            `SELECT r.*, t.title as test_title
             FROM results r
             JOIN tests t ON r.test_id = t.id
             WHERE r.user_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );
        return result.rows;
    },
};