# Khoj Backend API

Backend service for Khoj — Centralized Event & Contest Discovery Platform.

## Setup & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `PORT` (default: `5000`) and `FRONTEND_URL` (default: `http://localhost:3000`) are set.

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build & Production Run
```bash
npm run build
npm start
```

### 5. Health Check
```bash
curl http://localhost:5000/api/health
```

