import express, { Express } from 'express';
import cors from 'cors';
import healthRouter from './routes/health.route';
import authRouter from './routes/auth.route';
import eventRouter from './routes/event.route';
import categoryRouter from './routes/category.route';
import userRouter from './routes/user.route';
import aiRouter from './routes/ai.route';
import commentRouter from './routes/comment.route';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = [
  frontendUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
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
app.use('/api/comments', commentRouter);

// 404 handler for unmatched routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
