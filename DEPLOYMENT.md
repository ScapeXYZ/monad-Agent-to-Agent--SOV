# A2A Telegram Bot - Production Deployment

## Quick Start

### 1. Configure Environment
```bash
cd ~/mev-bot
cp .env.example .env
nano .env
```

Required in `.env`:
- `TELEGRAM_BOT_TOKEN` - Get from @BotFather
- `CLIENT_PRIVATE_KEY` - Your wallet private key
- `WORKER_ADDRESS` - Smart Account to monitor (optional, defaults to SOV contract)

### 2. Start the Bot
```bash
# Manual start
./start.sh

# Or directly
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Verify
```bash
pm2 list                    # Should show a2a-telegram-bot
pm2 logs a2a-telegram-bot   # View logs
```

## Commands

| Command | Description |
|---------|-------------|
| `/monitor` | Start monitoring for payment signals |
| `/hire` | Send 0.0001 MON to trigger signal |
| `/status` | Check worker balance |

## Process Management

```bash
# View status
pm2 list
pm2 monit

# Restart
pm2 restart a2a-telegram-bot

# Stop
pm2 stop a2a-telegram-bot

# Logs
pm2 logs a2a-telegram-bot --lines 100
```

## Files

| File | Purpose |
|------|---------|
| `bot.js` | Main Telegram bot |
| `a2a_loop.js` | Monitoring logic |
| `ecosystem.config.js` | PM2 configuration |
| `.env` | Environment variables (create from .env.example) |
| `start.sh` | Startup script |

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

## Troubleshooting

**Bot not responding?**
```bash
pm2 logs a2a-telegram-bot
```

**Telegram errors?**
```bash
# Check token is valid in .env
cat .env | grep TELEGRAM
```

**RPC timeouts?**
```bash
# Check Monad testnet connectivity
curl -X POST https://testnet-rpc.monad.xyz -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'
```

## Production Checklist

- [ ] TELEGRAM_BOT_TOKEN configured
- [ ] CLIENT_PRIVATE_KEY configured  
- [ ] PM2 startup configured (`pm2 startup`)
- [ ] Logs rotation setup
- [ ] Monitoring alerts configured (optional)
