import TelegramBot from 'node-telegram-bot-api';
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { startMonitoring } from './a2a_loop.js';
import 'dotenv/config';

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const clientAccount = privateKeyToAccount(process.env.CLIENT_PRIVATE_KEY);
const client = createWalletClient({
  account: clientAccount,
  chain: { id: 10143, name: 'Monad Testnet', rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } } },
  transport: http()
});

const WORKER_ADDRESS = '0x164e7A98fa7Bd34679522c470bF68D66C5b00C66';

bot.onText(/\/monitor/, (msg) => {
  bot.sendMessage(msg.chat.id, "👷 Worker Agent: Online. Monitoring signals...");
  startMonitoring(msg.chat.id, bot);
});

bot.onText(/\/hire/, async (msg) => {
  bot.sendMessage(msg.chat.id, "🤖 Agent B: Hiring Worker Agent...");
  try {
    const hash = await client.sendTransaction({
      to: WORKER_ADDRESS,
      value: parseEther('0.0001')
    });
    bot.sendMessage(msg.chat.id, "💸 Agent B: Payment Sent! Hash: " + hash);
  } catch (error) {
    bot.sendMessage(msg.chat.id, "❌ Error: " + error.message);
  }
});

console.log("🚀 Bot is fixed and running!");
