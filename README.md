# A2A SovereignAgent - Telegram Bot

Agent-to-Agent communication demo using Telegram for coordination and Monad Testnet for payments.

## Quick Start

```bash
cd ~/mev-bot
cp .env.example .env
nano .env  # Add TELEGRAM_BOT_TOKEN and CLIENT_PRIVATE_KEY
./start.sh
```

## Commands

| Command | Description |
|---------|-------------|
| `/monitor worker` | Start monitoring for payment signals |
| `/hire` | Send payment to trigger A2A signal |
| `/status` | Check worker balance and status |
| `/stop` | Stop bot |

## Architecture

```
Telegram User
      ↓
/hire command
      ↓
Telegram Bot (bot.js)
      ↓
sendTransaction() → Monad Testnet
      ↓
Smart Account (0x164e7A9...)
      ↓
A2A Monitor (a2a_loop.js)
      ↓
Signal Detected! → Telegram Notification
```

## Security Features

- ✅ **Rate Limiting**: Max 5 hires/minute per user
- ✅ **Chat Whitelist**: Only authorized users can hire
- ✅ **Input Validation**: All env vars validated at startup
- ✅ **Graceful Shutdown**: SIGINT/SIGTERM handlers

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | - | Bot token from @BotFather |
| `CLIENT_PRIVATE_KEY` | Yes | - | Wallet private key (0x prefix) |
| `WORKER_ADDRESS` | No | SOV SA | Smart Account to monitor |
| `CHAIN_ID` | No | 10143 | Monad Testnet |
| `HIRE_AMOUNT` | No | 0.0001 | Payment per /hire |
| `POLL_INTERVAL` | No | 5000 | Monitoring poll rate (ms) |
| `AUTHORIZED_CHAT_IDS` | No | - | Comma-separated allowed users |

## Files

| File | Purpose |
|------|---------|
| `bot.js` | Main Telegram bot |
| `a2a_loop.js` | Monitoring with rate limiting |
| `ecosystem.config.js` | PM2 deployment |
| `start.sh` | Startup script |
| `DEPLOYMENT.md` | Production guide |

## Deployment

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# View logs
pm2 logs a2a-telegram-bot

# Restart
pm2 restart a2a-telegram-bot
```

## Limitations (Known)

- **Mock UserOp**: Currently simulates ERC-4337 (polling-based)
- **Polling vs WebSocket**: Monad testnet doesn't support event subscriptions yet
- **Private Key**: Stored in env (use MPC/HSM for production)

## Next Steps

1. Implement real ERC-4337 with @metamask/smart-accounts-kit
2. Add WebSocket support when available on Monad
3. Use MPC wallet or HSM for key security
