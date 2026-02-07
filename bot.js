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
      kzg: null // Gas safety for Monad
    });
    bot.sendMessage(chatId, "✅ Agent B: Payment Sent!\nHash: " + hash);
  } catch (error) {
    console.error("Hire Error:", error.message);
    bot.sendMessage(chatId, "❌ Agent B: Payment failed. Check logs.");
  }
});

console.log("🚀 Bot is running with full validation!");
