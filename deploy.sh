#!/usr/bin/env bash
# =============================================================================
# Amarktai Network – Ubuntu VPS Deployment Script (Ubuntu 22.04)
#
# Usage:
#   chmod +x deploy.sh
#   sudo ./deploy.sh
#
# Run this script once on a fresh server. For updates use deploy-update.sh.
# =============================================================================
set -euo pipefail

DOMAIN="your-domain.com"        # ← change this
APP_DIR="/var/www/amarktai"
REPO_URL="https://github.com/sharetheherbman-debug/kinship.git"
BRANCH="main"

# Validate domain has been configured
if [ "$DOMAIN" = "your-domain.com" ]; then
    echo "❌  ERROR: Please edit deploy.sh and set DOMAIN to your actual domain before running."
    exit 1
fi

echo "============================================================"
echo " Amarktai Network – VPS Setup"
echo " Domain : $DOMAIN"
echo " App dir: $APP_DIR"
echo "============================================================"

# ---- 1. System dependencies -------------------------------------------------
echo "[1/9] Updating system packages..."
apt-get update -q
apt-get install -y -q \
    curl wget git nginx certbot python3-certbot-nginx \
    python3 python3-pip python3-venv \
    build-essential libssl-dev libffi-dev \
    gnupg lsb-release

# ---- 2. Node.js 20 (for building the frontend) ------------------------------
echo "[2/9] Installing Node.js 20..."
if ! command -v node &>/dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
npm install -g yarn

# ---- 3. MongoDB 7 -----------------------------------------------------------
echo "[3/9] Installing MongoDB..."
if ! command -v mongod &>/dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc \
        | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
        https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
        | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update -q
    apt-get install -y mongodb-org
    systemctl enable mongod
    systemctl start mongod
fi

# ---- 4. Clone / pull code ---------------------------------------------------
echo "[4/9] Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
    cd "$APP_DIR"
    git pull origin "$BRANCH"
else
    git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

# ---- 5. Backend setup -------------------------------------------------------
echo "[5/9] Setting up Python backend..."
cd "$APP_DIR/backend"

if [ ! -d "$APP_DIR/venv" ]; then
    python3 -m venv "$APP_DIR/venv"
fi
"$APP_DIR/venv/bin/pip" install --upgrade pip -q
"$APP_DIR/venv/bin/pip" install -r requirements.txt -q

# Copy env file if not present
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created backend/.env from template – please fill in your secrets!"
fi

# ---- 6. Frontend build ------------------------------------------------------
echo "[6/9] Building React frontend..."
cd "$APP_DIR/frontend"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created frontend/.env from template – please set REACT_APP_BACKEND_URL!"
fi

yarn install --frozen-lockfile --silent
yarn build

# ---- 7. Systemd service -----------------------------------------------------
echo "[7/9] Installing systemd service..."
cp "$APP_DIR/kinship-backend.service" /etc/systemd/system/amarktai-backend.service
systemctl daemon-reload
systemctl enable amarktai-backend
systemctl restart amarktai-backend

# ---- 8. Nginx ---------------------------------------------------------------
echo "[8/9] Configuring Nginx..."
# Replace placeholder domain in config
sed "s/your-domain.com/$DOMAIN/g" "$APP_DIR/nginx.conf" \
    > /etc/nginx/sites-available/amarktai

ln -sf /etc/nginx/sites-available/amarktai /etc/nginx/sites-enabled/amarktai
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ---- 9. SSL (Let's Encrypt) -------------------------------------------------
echo "[9/9] Obtaining SSL certificate..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
    --non-interactive --agree-tos -m "admin@$DOMAIN" \
    --redirect || echo "⚠️  Certbot failed – run manually after DNS propagates"

echo ""
echo "============================================================"
echo " ✅  Deployment complete!"
echo "    Backend service : sudo systemctl status amarktai-backend"
echo "    Logs            : journalctl -u amarktai-backend -f"
echo "    Frontend URL    : https://$DOMAIN"
echo ""
echo " Next steps:"
echo "  1. Edit $APP_DIR/backend/.env with your secrets"
echo "  2. Edit $APP_DIR/frontend/.env with REACT_APP_BACKEND_URL"
echo "  3. Rebuild frontend: cd $APP_DIR/frontend && yarn build"
echo "  4. Restart backend: sudo systemctl restart amarktai-backend"
echo "============================================================"
