import 'dotenv/config';
import { createPublicClient, http, formatEther, getTransactionCount } from 'viem';

// Configuration from environment
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '10143');
const RPC_URL = process.env.RPC_URL || 'https://testnet-rpc.monad.xyz';
const TARGET = process.env.WORKER_ADDRESS || '0x164e7A98fa7Bd34679522c470bF68D66C5b00C66';
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || '5000');

// Authorized users (whitelist)
const AUTHORIZED_USERS = (process.env.AUTHORIZED_CHAT_IDS || '7146354764,1247450434').split(',');

// Rate limiting
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 5; // Max 5 hires per window
const userRateLimit = new Map();

// RPC client
const client = createPublicClient({
  chain: { id: CHAIN_ID, name: 'Monad Testnet', rpcUrls: { default: { http: [RPC_URL] } } },
  transport: http(RPC_URL)
});

export function checkRateLimit(chatId) {
  const now = Date.now();
  const userHistory = userRateLimit.get(chatId) || [];
  
  // Clean old entries
  const recent = userHistory.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (recent.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  recent.push(now);
  userRateLimit.set(chatId, recent);
  return true;
}

export function getWorkerStatus() {
  return { target: TARGET, chainId: CHAIN_ID };
}

export async function startMonitoring(chatId, bot) {
  if (!AUTHORIZED_USERS.includes(chatId.toString())) {
    bot.sendMessage(chatId, "⛔ Unauthorized. Your chat ID is not whitelisted.");
    return;
  }
  
  let lastBal = BigInt(0);
  let lastNonce = 0;
  
  try {
    lastBal = await client.getBalance({ address: TARGET });
    lastNonce = await getTransactionCount({ address: TARGET });
  } catch (e) {
    console.error("⚠️ Initial RPC fetch failed:", e.message);
  }
  
  console.log(`🟢 AGENT START: Monitoring ${TARGET} (Chain: ${CHAIN_ID})`);
  bot.sendMessage(chatId, `✅ Worker Agent: Active\n👷 Watching: ${TARGET}\n💰 Start: ${formatEther(lastBal)} MON`);

  // Polling for balance changes (WebSocket not available on Monad testnet)
  const unwatch = setInterval(async () => {
    try {
      const currentBal = await client.getBalance({ address: TARGET });
      const currentNonce = await getTransactionCount({ address: TARGET });
      
      // Log for debugging
      const balStr = formatEther(currentBal);
      if (currentBal !== lastBal) {
        console.log(`🚨 SIGNAL! Balance: ${balStr} MON (+${formatEther(currentBal - lastBal)})`);
        bot.sendMessage(chatId, `🚨 SIGNAL DETECTED!\n💰 New Balance: ${balStr} MON\n📈 Change: +${formatEther(currentBal - lastBal)}`);
        lastBal = currentBal;
      }
      
      // Detect new transactions via nonce
      if (currentNonce > lastNonce) {
        console.log(`🚨 SIGNAL! Nonce: ${currentNonce} (+${currentNonce - lastNonce})`);
        bot.sendMessage(chatId, `🚨 NEW TRANSACTION!\n🔢 Nonce: ${currentNonce}\n📊 TX Count: ${currentNonce}`);
        lastNonce = currentNonce;
      }
      
    } catch (e) {
      console.log("⚠️ RPC Error:", e.message.slice(0, 50));
    }
  }, POLL_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(unwatch);
    console.log("🛑 Monitor stopped");
  };
}
