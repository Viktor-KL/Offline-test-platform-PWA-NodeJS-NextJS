import { getPool } from '../db/connection';
import { User, CreateUserDto } from '../models/User';

export const userRepository = {
    async findByEmail(email: string): Promise<User | null> {
        const pool = getPool()
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )
        return result.rows[0] || null
    },

    async findById(id: number): Promise<User | null> {
        const pool = getPool();
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    },

    async create(data: CreateUserDto): Promise<User> {
        const pool = getPool();
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [data.name, data.email, data.password_hash]
        );
        return result.rows[0];
    },
}