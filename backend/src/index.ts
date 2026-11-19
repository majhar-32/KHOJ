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
