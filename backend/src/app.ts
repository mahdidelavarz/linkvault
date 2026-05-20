import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth.route';
import { errorHandler } from './middleware/errorHandler';
import linkRoutes from './routes/links.route';
import categoryRoutes from './routes/category.route';
import tagRoutes from './routes/tag.route';
import noteRoutes from './routes/note.route';
import snippetRoutes from './routes/snippet.route';
import searchRoutes from './routes/search.route';
import promptRoutes from './routes/prompt.route';
import dashboardRoutes from './routes/dashboard.route';
import apiRoutes from './routes/api.route';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/snippets' , snippetRoutes)
app.use('/api/search', searchRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/api-client', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Database connection
AppDataSource.initialize()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
    });

export default app;