import { getPool } from '../db/connection';
import { Test, Question } from '../models/Test';

export const testRepository = {
    async findAll(): Promise<Test[]> {
        const pool = getPool()
        const result = await pool.query(
            'SELECT * FROM tests'
        )
        return result.rows
    },

    async findById(id: number): Promise<Question[]> {
        const pool = getPool()
        const result = await pool.query(
            'SELECT * FROM tests WHERE id = $1',
            [id]
        )
        return result.rows
    },

    async findQuestionByTestId(testId: number): Promise<Test | null> {
        const pool = getPool()
        const result = await pool.query(
            'SELECT * FROM questions WHERE test_id = $1 ORDER BY order_index',
            [testId]
        )
        return result.rows[0] || null
    }
}