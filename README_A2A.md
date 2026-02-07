# A2A Telegram Bot Setup

## Quick Start

1. **Install dependencies:**
```bash
cd ~/mev-bot
npm install node-telegram-bot-api dotenv
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your actual values
nano .env
```

Required variables:
- `TELEGRAM_BOT_TOKEN` - Get from @BotFather
- `CLIENT_PRIVATE_KEY` - Your wallet private key (without 0x)
- `WORKER_ADDRESS` - The Smart Account to monitor (optional, defaults to our SA)

3. **Run the bot:**
```bash
node bot.js
```

## Bot Commands

| Command | Description |
|---------|-------------|
| `/monitor` | Start monitoring for payments |
| `/hire` | Send 0.0001 MON to the worker |
| `/status` | Check worker balance and status |
| `/stop` | Stop monitoring |

## Architecture

```
┌─────────────────┐      /hire       ┌─────────────────┐
│   Telegram     │ ───────────────▶ │   Agent B       │
│   User          │                  │   (Client)      │
└─────────────────┘                  └────────┬────────┘
                                           │ sendTransaction
                                           ▼
┌─────────────────┐                ┌─────────────────┐
│   A2A Monitor   │ ◀───────────── │   Smart Account │
│   (polling)     │    detect      │   (Worker)      │
└─────────────────┘                └─────────────────┘
```

## Files

- `bot.js` - Main Telegram bot
- `.env` - Configuration (create from .env.example)
- `a2a_loop.js` - Monitoring logic (built into bot.js for simplicity)
