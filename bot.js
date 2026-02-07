import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { startMonitoring } from './a2a_loop.js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const clientAccount = privateKeyToAccount(process.env.CLIENT_PRIVATE_KEY);
const WORKER_ADDRESS = process.env.WORKER_ADDRESS;

const client = createWalletClient({
  account: clientAccount,
  chain: { id: 10143, name: 'Monad Testnet', rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } } },
  transport: http()
});

bot.onText(/\/monitor/, (msg) => {
  bot.sendMessage(msg.chat.id, "👷 Worker Agent: Online. Monitoring " + WORKER_ADDRESS);
  startMonitoring(msg.chat.id, bot);
});

bot.onText(/\/hire/, async (msg) => {
  bot.sendMessage(msg.chat.id, "🤖 Agent B: Initiating Payment to Worker...");
  try {
    const hash = await client.sendTransaction({
      to: WORKER_ADDRESS,
      value: parseEther('0.0001')
    });
    bot.sendMessage(msg.chat.id, "💸 Agent B: Success! Hash: " + hash);
  } catch (error) {
    bot.sendMessage(msg.chat.id, "❌ Agent B: Error: " + error.message);
  }
});

console.log("🚀 A2A System Live. Using Worker: " + WORKER_ADDRESS);
