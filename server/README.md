# LexisAI - Backend API Server

This is the backend service for the LexisAI platform, built with a scalable, modular Node.js architecture.

## 🛠️ Tech Stack

- **Framework**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (hosted on NeonDB)
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JSON Web Tokens (Access + Refresh tokens)
- **Caching/Queues**: Redis + BullMQ
- **Logging**: Winston & Morgan
- **Security**: Helmet, CORS, Express Rate Limit, xss-clean

## 📁 Architecture Overview

The backend uses a clean, feature-based modular architecture to ensure separation of concerns:

```text
server/src/
├── config/       # Environment variables & constants
├── database/     # Prisma client initialization
├── middleware/   # Global Express middlewares (Auth, Error handler, Validation)
├── modules/      # Feature modules (auth, users, cases, documents)
│   └── [feature]/
│       ├── *.controller.ts
│       ├── *.service.ts
│       └── *.routes.ts
├── utils/        # Shared helper utilities (Logger, AppError)
├── lib/          # Third-party library abstractions (Redis, S3)
├── jobs/         # BullMQ queue processors and workers
└── app.ts        # Express app setup
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (or a NeonDB connection string)
- Redis server running locally or remotely

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Setup:
   Copy `.env.example` to `.env` and fill in your actual credentials, specifically the `DATABASE_URL`.
   ```bash
   cp .env.example .env
   ```

3. Database Setup:
   Push the Prisma schema to your database and generate the Prisma Client.
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## 🔒 Security & Best Practices
- **Authentication**: Uses short-lived access tokens and long-lived refresh tokens stored securely in HTTP-only cookies.
- **Validation**: Strict runtime validation of all request bodies, params, and queries using Zod.
- **Error Handling**: Centralized global error handling ensuring consistent API response structures without leaking stack traces in production.
