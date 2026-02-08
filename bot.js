import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { startMonitoring, checkRateLimit, getWorkerStatus } from './a2a_loop.js';

// Validation
const requiredEnv = ['TELEGRAM_BOT_TOKEN', 'CLIENT_PRIVATE_KEY'];
requiredEnv.forEach(env => {
  if (!process.env[env]) {
    console.error(`❌ Missing ${env} in .env file`);
    process.exit(1);
  }
});

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const WORKER_ADDRESS = process.env.WORKER_ADDRESS || '0x164e7A98fa7Bd34679522c470bF68D66C5b00C66';
const { createWalletClient, http, parseEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

// Client setup
const clientAccount = privateKeyToAccount(process.env.CLIENT_PRIVATE_KEY);
const client = createWalletClient({
  account: clientAccount,
  chain: { 
    id: parseInt(process.env.CHAIN_ID || '10143'), 
    name: 'Monad Testnet', 
    rpcUrls: { default: { http: [process.env.RPC_URL || 'https://testnet-rpc.monad.xyz'] } } 
  },
  transport: http()
});

let monitoringCleanup = null;

// Commands
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "👋 Welcome! A2A SovereignAgent Bot is active.\nCommands: /monitor, /hire, /status");
});

bot.onText(/\/monitor/, (msg) => {
  const chatId = msg.chat.id.toString();
  
  if (!checkRateLimit(chatId)) {
    // Still allow monitoring, just warn
    console.log(`⚠️ Rate limit warning for ${chatId}`);
  }
  
  console.log(`📥 /monitor from ${chatId}`);
  monitoringCleanup = startMonitoring(chatId, bot);
});

bot.onText(/\/hire/, async (msg) => {
  const chatId = msg.chat.id.toString();
  
  // Rate limiting
  if (!checkRateLimit(chatId)) {
    bot.sendMessage(msg.chat.id, "⛔ Rate limit exceeded. Wait 1 minute between hires.");
    return;
  }
  
  bot.sendMessage(chatId, "🤖 Agent B: Hiring Worker Agent...");
  
  try {
    const hash = await client.sendTransaction({
      to: WORKER_ADDRESS,
      value: parseEther(process.env.HIRE_AMOUNT || '0.0001'),
      gas: 21000n
    });
    bot.sendMessage(chatId, `✅ Payment Sent!\n📤 Hash: ${hash}\n💰 Amount: ${process.env.HIRE_AMOUNT || '0.0001'} MON`);
  } catch (error) {
    console.error("Hire Error:", error.message);
    bot.sendMessage(chatId, "❌ Payment failed. Check logs.");
  }
});

bot.onText(/\/status/, async (msg) => {
  try {
    const balance = await client.getBalance({ address: WORKER_ADDRESS });
    const { target, chainId } = getWorkerStatus();
    bot.sendMessage(msg.chat.id, 
      `📊 A2A Status:\n👷 Worker: ${target.slice(0,10)}...${target.slice(-6)}\n💰 Balance: ${(Number(balance)/1e18).toFixed(4)} MON\n🔗 Chain: ${chainId}`);
  } catch (error) {
    bot.sendMessage(msg.chat.id, "❌ Error checking status: " + error.message.slice(0,100));
  }
});

bot.onText(/\/stop/, async (msg) => {
  if (monitoringCleanup) {
    monitoringCleanup();
    monitoringCleanup = null;
  }
  bot.sendMessage(msg.chat.id, "🛑 Bot stopped.");
  bot.stopPolling();
  process.exit(0);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  if (monitoringCleanup) monitoringCleanup();
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received...');
  if (monitoringCleanup) monitoringCleanup();
  bot.stopPolling();
  process.exit(0);
});

console.log("🚀 A2A Telegram Bot is running!");
console.log("👤 Client:", clientAccount.address);
console.log("👷 Worker:", WORKER_ADDRESS);
