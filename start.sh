#!/bin/bash
# A2A Telegram Bot - Startup Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting A2A Telegram Bot..."
echo "📁 Working directory: $SCRIPT_DIR"

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "   Copy .env.example to .env and fill in your values:"
    echo "   cp .env.example .env"
    echo "   nano .env"
    exit 1
fi

# Validate required env vars
source .env 2>/dev/null || true

if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ "$TELEGRAM_BOT_TOKEN" = "your_telegram_bot_token_here" ]; then
    echo "⚠️  TELEGRAM_BOT_TOKEN not configured!"
    echo "   Edit .env and add your bot token."
    exit 1
fi

if [ -z "$CLIENT_PRIVATE_KEY" ] || [ "$CLIENT_PRIVATE_KEY" = "0xyour_private_key" ]; then
    echo "⚠️  CLIENT_PRIVATE_KEY not configured!"
    echo "   Edit .env and add your private key."
    exit 1
fi

# Check if already running
if pm2 list | grep -q "a2a-telegram-bot"; then
    echo "✅ Bot already running (restarting)..."
    pm2 restart a2a-telegram-bot
else
    echo "📦 Starting bot with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
fi

echo ""
echo "✅ A2A Bot is running!"
echo "   Commands:"
echo "   pm2 logs a2a-telegram-bot  # View logs"
echo "   pm2 restart a2a-telegram-bot  # Restart"
echo "   pm2 stop a2a-telegram-bot   # Stop"
echo "   pm2 monit                # Real-time monitoring"
