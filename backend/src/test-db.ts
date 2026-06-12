import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { User } from './entities/User';

async function testConnection() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connection successful!');
        
        // Test creating a user
        const userRepository = AppDataSource.getRepository(User);
        const testUser = userRepository.create({
            username: 'testuser',
            passwordHash: 'hashedpassword'
        });
        
        await userRepository.save(testUser);
        console.log('✅ Test user created successfully!');
        
        // Clean up test user
        await userRepository.remove(testUser);
        console.log('✅ Test user removed successfully!');
        
        await AppDataSource.destroy();
        console.log('✅ Database connection closed.');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testConnection();