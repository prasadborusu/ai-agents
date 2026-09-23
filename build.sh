#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Building React frontend..."
cd frontend
npm ci
npm run build
cd ..

echo "==> Bundling frontend into backend static folder..."
mkdir -p backend/static
cp -r frontend/dist/* backend/static/

echo "==> Installing Python backend dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "==> Unified build completed successfully!"
