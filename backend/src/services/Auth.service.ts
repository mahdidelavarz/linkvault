import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { PasswordResetToken } from '../entities/PasswordResetToken';
import { jwtConfig } from '../config/jwt';
import { sendPasswordResetEmail } from '../utils/mailer';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);
    private resetTokenRepository = AppDataSource.getRepository(PasswordResetToken);

    async register(username: string, password: string, email?: string): Promise<{ user: Partial<User>; token: string }> {
        const existingUser = await this.userRepository.findOne({ where: { username } });
        if (existingUser) {
            throw new Error('Username already exists');
        }

        if (email) {
            const emailTaken = await this.userRepository.findOne({ where: { email } });
            if (emailTaken) throw new Error('Email already in use');
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = this.userRepository.create({ username, passwordHash, email });
        await this.userRepository.save(user);

        const token = this.generateToken(user);
        return { user: this.sanitizeUser(user), token };
    }

    async login(username: string, password: string): Promise<{ user: Partial<User>; token: string }> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) throw new Error('Invalid credentials');

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) throw new Error('Invalid credentials');

        const token = this.generateToken(user);
        return { user: this.sanitizeUser(user), token };
    }

    async getCurrentUser(userId: number): Promise<Partial<User>> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new Error('User not found');
        return this.sanitizeUser(user);
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        // Always resolve — never reveal whether the email is registered
        if (!user) return;

        // Invalidate any existing unused tokens for this user
        await this.resetTokenRepository.update(
            { userId: user.id, used: false },
            { used: true }
        );

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        const resetToken = this.resetTokenRepository.create({ token, userId: user.id, expiresAt });
        await this.resetTokenRepository.save(resetToken);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
        await sendPasswordResetEmail(email, resetUrl);
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const resetToken = await this.resetTokenRepository.findOne({
            where: { token, used: false },
        });

        if (!resetToken || resetToken.expiresAt < new Date()) {
            throw new Error('Invalid or expired reset link');
        }

        const user = await this.userRepository.findOne({ where: { id: resetToken.userId } });
        if (!user) throw new Error('User not found');

        const salt = await bcrypt.genSalt(12);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await this.userRepository.save(user);

        resetToken.used = true;
        await this.resetTokenRepository.save(resetToken);
    }

    private generateToken(user: User): string {
        const payload = { userId: user.id, username: user.username };
        return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions);
    }

    private sanitizeUser(user: User): Partial<User> {
        const { passwordHash, ...rest } = user;
        return rest;
    }
}
