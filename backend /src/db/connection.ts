import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config()

let instance: Pool | null = null

export const getPool = (): Pool => {
    if (!instance) {
        instance = new Pool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        })

        console.log('Database pool created');
    }

    return instance
}