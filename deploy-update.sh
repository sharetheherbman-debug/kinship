#!/usr/bin/env bash
# =============================================================================
# Kinship Journeys – Zero-downtime update script
# Run this to deploy new code changes to an already-set-up VPS
# =============================================================================
set -euo pipefail

APP_DIR="/var/www/kinship"
BRANCH="main"

echo "[1/4] Pulling latest code..."
cd "$APP_DIR"
git pull origin "$BRANCH"

echo "[2/4] Updating Python dependencies..."
"$APP_DIR/venv/bin/pip" install -r backend/requirements.txt -q

echo "[3/4] Rebuilding frontend..."
cd "$APP_DIR/frontend"
yarn install --frozen-lockfile --silent
yarn build

echo "[4/4] Restarting backend service..."
systemctl restart kinship-backend

echo "✅  Update complete."
