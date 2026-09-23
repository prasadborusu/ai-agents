# Multi-stage Dockerfile for unified deployment (Frontend + Backend)

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend runtime
FROM python:3.11-slim
WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets into backend static folder
COPY --from=frontend-builder /app/frontend/dist ./backend/static

ENV PORT=8000
ENV ENVIRONMENT=production
EXPOSE 8000

WORKDIR /app/backend
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
