import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { jwtConfig } from '../config/jwt';

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    async register(username: string, password: string): Promise<{ user: Partial<User>; token: string }> {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({ where: { username } });
        if (existingUser) {
            throw new Error('Username already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = this.userRepository.create({
            username,
            passwordHash
        });

        await this.userRepository.save(user);

        // Generate token
        const token = this.generateToken(user);

        return { user: this.sanitizeUser(user), token };
    }

    async login(username: string, password: string): Promise<{ user: Partial<User>; token: string }> {
        // Find user
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Generate token
        const token = this.generateToken(user);

        return { user: this.sanitizeUser(user), token };
    }

    async getCurrentUser(userId: number): Promise<Partial<User>> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        return this.sanitizeUser(user);
    }

    private generateToken(user: User): string {
        const payload = { 
            userId: user.id, 
            username: user.username 
        };
        
        // Fix: Use proper typing for jwt.sign
        return jwt.sign(
            payload, 
            jwtConfig.secret, 
            { 
                expiresIn: jwtConfig.expiresIn 
            } as jwt.SignOptions
        );
    }

    private sanitizeUser(user: User): Partial<User> {
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}