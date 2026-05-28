import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables');
}

export const authService = {
    async register(name: string, email: string, password: string) {
        const existing = await userRepository.findByEmail(email);
        if (existing) {
            throw new Error('User with this email already exists');
        }

        const password_hash = await bcrypt.hash(password, 10);
        const user = await userRepository.create({ name, email, password_hash });

        const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

        return {
            user: { id: user.id, name: user.name, email: user.email },
            accessToken,
            refreshToken,
        };
    },

    async login(email: string, password: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

        return {
            user: { id: user.id, name: user.name, email: user.email },
            accessToken,
            refreshToken,
        };
    },

    async refresh(refreshToken: string) {
        try {
            const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number };
            const user = await userRepository.findById(payload.userId);

            if (!user) {
                throw new Error('User not found');
            }

            const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });

            return { accessToken, user: { id: user.id, name: user.name, email: user.email } };
        } catch {
            throw new Error('Invalid refresh token');
        }
    },
}