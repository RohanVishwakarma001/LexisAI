# LexisAI - Enterprise Legal Case & Document Management

LexisAI is a modern, production-grade SaaS application designed for law firms and independent lawyers to manage cases, process legal documents using AI, and streamline their workflow.

## 🚀 Key Features

- **Advanced Case Management**: Track case statuses, assign lawyers, and maintain detailed case timelines.
- **AI-Powered Document Processing**: Upload PDFs, extract text via OCR, and generate automated AI summaries.
- **Smart AI Legal Assistant**: Vector-ready chat assistant capable of answering legal queries based on case history.
- **Enterprise Security**: Role-Based Access Control (Admin, Lawyer, User), secure JWT authentication with refresh token rotation.
- **Real-time Notifications**: Event-driven architecture for instant updates.

## 🛠️ Technology Stack

This project is built using a modern decoupled architecture:

### Frontend (`/client`)
- **Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Dark Mode, Glassmorphism UI)
- **State Management**: Zustand
- **Data Fetching & API**: Axios, React Query (planned)
- **Forms & Validation**: React Hook Form, Zod

### Backend (`/server`)
- **Core**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (hosted on NeonDB)
- **ORM**: Prisma
- **Caching & Queues**: Redis, BullMQ
- **Authentication**: JWT (HttpOnly Cookies), bcryptjs
- **Security**: Helmet, Express Rate Limit, xss-clean
- **Storage**: AWS S3 (for document uploads)

## 📁 Project Structure

```text
LexisAI/
├── client/     # React Frontend application
├── server/     # Node.js/Express Backend application
└── README.md   # Project overview
```

## ⚙️ Getting Started

To run this project locally, you will need **Node.js (v18+)**, **PostgreSQL**, and **Redis** running on your machine.

Please refer to the specific README files in the respective directories for setup instructions:
- [Frontend Setup Instructions](./client/README.md)
- [Backend Setup Instructions](./server/README.md)

---
*Built with ❤️ by the LexisAI Engineering Team*
