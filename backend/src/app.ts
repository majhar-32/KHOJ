import express, { Express } from 'express';
import cors from 'cors';
import healthRouter from './routes/health.route';
import authRouter from './routes/auth.route';
import eventRouter from './routes/event.route';
import categoryRouter from './routes/category.route';
import userRouter from './routes/user.route';
import aiRouter from './routes/ai.route';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: frontendUrl,
    credentials: true
  })
);

// Body parser
app.use(express.json());

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/events', eventRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/users', userRouter);
app.use('/api/ai', aiRouter);

// 404 handler for unmatched routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
