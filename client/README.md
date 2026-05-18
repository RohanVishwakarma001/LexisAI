# LexisAI - Frontend Client

This is the frontend application for the LexisAI platform, built with enterprise-grade React architecture.

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **API Client**: Axios

## 📁 Architecture Overview

The application follows a highly scalable, feature-based folder structure:

```text
client/src/
├── assets/       # Static assets (images, icons)
├── components/   # Reusable global UI components (Button, Input, Card)
├── config/       # Environment variables and global config
├── features/     # Feature-specific modules (auth, cases, ai-chat)
├── hooks/        # Global custom React hooks
├── layouts/      # Page layout wrappers (Sidebar, Navbar)
├── lib/          # Third-party library initializations (Axios)
├── pages/        # Route components
├── store/        # Global Zustand stores
├── types/        # Global TypeScript interfaces
└── utils/        # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- NPM or Yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   Copy `.env.example` to `.env` (if applicable) and configure your backend API URL.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🎨 Design System
The frontend utilizes a custom Tailwind configuration to achieve a premium "glassmorphic" dark mode aesthetic. Utility classes are strictly enforced to maintain design consistency.
