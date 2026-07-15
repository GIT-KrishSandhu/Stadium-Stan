# Stadium Stan

Stadium Stan is an autonomous AI-powered stadium operations platform.

## Architecture

- **Frontend**: Next.js (TypeScript, Tailwind, App Router)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (Production Primary Database)
- **Cache**: Redis

Stadium Stan is an autonomous AI-powered stadium operations platform.

## Architecture Setup
This is a monorepo setup containing:
- `apps/web`: Next.js frontend
- `apps/api`: FastAPI backend
- `packages/`: Shared logic and agent code

## Prerequisites
- Docker and Docker Compose

## Getting Started
1. Copy `.env.example` to `.env`
2. Run `docker-compose up --build -d postgres redis` to start services
3. The frontend will be available at `http://localhost:3000`
4. The backend will be available at `http://localhost:8000/docs`

## Deployment Targets
- **Frontend**: Vercel
- **Backend**: Vercel
- **LLM**: Groq (via LiteLLM)

## Troubleshooting
If you have a local PostgreSQL installation, Stadium Stan uses port 5433 by default to avoid conflicts. Make sure your `.env` contains `localhost:5433` and your Docker is running the database container correctly.
