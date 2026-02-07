import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { startMonitoring } from './a2a_loop.js';

// 1. Validation
const requiredEnv = ['TELEGRAM_BOT_TOKEN', 'CLIENT_PRIVATE_KEY', 'WORKER_ADDRESS'];
requiredEnv.forEach(env => {
  if (!process.env[env]) throw new Error(`Missing ${env} in .env file`);
});

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// 2. Client Setup
const clientAccount = privateKeyToAccount(process.env.CLIENT_PRIVATE_KEY);
const client = createWalletClient({
  account: clientAccount,
  chain: { id: 10143, name: 'Monad Testnet', rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } } },
  transport: http()
});

const WORKER_ADDRESS = process.env.WORKER_ADDRESS;

// 3. Commands
bot.onText(/\/monitor/, (msg) => {
  bot.sendMessage(msg.chat.id, "👷 Worker Agent: Online. Monitoring signals...");
  startMonitoring(msg.chat.id, bot);
});

bot.onText(/\/hire/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🤖 Agent B: Hiring Worker Agent...");
  
  try {
    const hash = await client.sendTransaction({
      to: WORKER_ADDRESS,
      value: parseEther('0.0001'),
      gas: 21000n  // Standard ETH transfer gas
    });
    bot.sendMessage(chatId, "✅ Agent B: Payment Sent!\nHash: " + hash);
  } catch (error) {
    console.error("Hire Error:", error.message);
    bot.sendMessage(chatId, "❌ Agent B: Payment failed. Check logs.");
  }
});

bot.onText(/\/status/, async (msg) => {
  try {
    const balance = await client.getBalance({ address: WORKER_ADDRESS });
    bot.sendMessage(msg.chat.id, `📊 Worker Status:\n👷 Address: ${WORKER_ADDRESS}\n💰 Balance: ${(Number(balance)/1e18).toFixed(4)} MON`);
  } catch (error) {
    bot.sendMessage(msg.chat.id, "❌ Error checking status: " + error.message);
  }
});

bot.onText(/\/stop/, async (msg) => {
  bot.sendMessage(msg.chat.id, "🛑 Stopping bot...");
  bot.stopPolling();
  process.exit(0);
});

// 4. Graceful Shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM...');
  bot.stopPolling();
  process.exit(0);
});

console.log("🚀 A2A Telegram Bot is running!");
console.log("Commands: /monitor, /hire, /status, /stop");
