# SovereignAgent (SOV) - Autonomous A2A Coordination

This project demonstrates a fully autonomous **Agent-to-Agent (A2A)** economic loop on the **Monad Testnet** using **ERC-4337 Account Abstraction**.

## 🚀 Vision
A protocol where agents hire other agents to perform on-chain tasks without human intervention, utilizing sovereign identities for secure execution.

## 🏗 Architecture

* **Identity**: MetaMask Smart Accounts Kit for sovereign UserOperations.
* **Coordination**: Economic signaling via MON transfers detected by a Viem listener.
* **UX**: Real-time audit logs and control via a Telegram Bot interface.

## 🛠 Setup & Run
1. **Configure Environment**: 
   Add `TELEGRAM_BOT_TOKEN`, `CLIENT_PRIVATE_KEY`, and `WORKER_ADDRESS` to your `.env`.
2. **Launch Bot**:
   `node bot.js`
3. **Execute Flow**:
   Use `/monitor` to start the listener, then `/hire` to trigger the autonomous payment and execution.

## 🔗 Verification
* **Network**: Monad Testnet (10143)
* **Smart Account**: ${process.env.WORKER_ADDRESS || '0x164e7A...'}
