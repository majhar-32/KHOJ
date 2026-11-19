import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './lib/prisma';

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, async () => {
  console.log(`Khoj backend running on http://localhost:${PORT}`);
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`Database connected successfully to Supabase.`);
  } catch (dbErr: any) {
    console.warn(`\n[WARNING] Database connection failed or Supabase is paused!`);
    console.warn(`Error:`, dbErr.message);
    console.warn(`If your Supabase project is paused, restore it at: https://supabase.com/dashboard/projects\n`);
  }
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ERROR] Port ${PORT} is already in use by another process.`);
    console.error(`To free port ${PORT}, run: lsof -ti:${PORT} | xargs kill -9\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Fast graceful shutdown for tsx watch & restarts — prevents port-locking and 5s force-kill delays
const shutdown = (signal: string) => {
  // Close all idle/active HTTP connections immediately so port 5001 is freed instantaneously
  if (typeof (server as any).closeAllConnections === 'function') {
    (server as any).closeAllConnections();
  }
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } catch {}
    process.exit(0);
  });

  // Force exit after 300ms if any lingering socket remains
  setTimeout(() => {
    process.exit(0);
  }, 300).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
