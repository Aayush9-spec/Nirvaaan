# Backend Workspace

This directory is reserved for dedicated backend services as the project grows.

Current state:
- Primary API routes still run from Next.js route handlers in `frontend/app/api`.
- Supabase database/auth lives in `/supabase`.

Suggested usage:
- Place standalone backend services here (Node/Fastify/Nest, workers, queues, webhooks).
- Keep shared server-only modules in `backend/src`.
