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



## 🏆 Bounty Milestone: Account Abstraction Proof
The following output confirms the successful generation of a **User Operation** using the MetaMask Smart Accounts Kit on Monad Testnet.

### User Operation Details
* **Hybrid Smart Account:** `0x164e7A98fa7Bd34679522c470bF68D66C5b00C66`
* **EntryPoint Address:** `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
* **UserOp Hash:** `0x7ca4f402e62360843317c879a4be207bcd9c4838496c511b75717b6f8f0141a7`

### A2A Handshake Verification
This UserOp was triggered autonomously by the **Worker Agent** upon detecting an on-chain signal (payment) from the **Client Agent**. This demonstrates a complete autonomous economic loop:
1. **Signal**: Client Agent sends 0.0001 MON.
2. **Detection**: Worker Agent identifies balance change via `a2a_loop.js`.
3. **Execution**: Worker Agent generates and signs a UserOp to execute the task.
