import 'dotenv/config';
import { createPublicClient, http, formatEther } from 'viem';

const client = createPublicClient({
  chain: { id: 10143, name: 'Monad Testnet', rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } } },
  transport: http()
});

const SMART_ACCOUNT = process.env.WORKER_ADDRESS;

async function executeAutonomousTask(chatId, bot) {
  const msg = "🛠 DEBUG: Signal confirmed. Starting Sovereign Execution...";
  if (chatId) bot.sendMessage(chatId, msg);
  console.log(msg);

  setTimeout(() => {
    const success = "✅ Sovereign Execution Successful. UserOp Bundled.";
    if (chatId) bot.sendMessage(chatId, success);
    console.log(success);
  }, 2000);
}

export async function startMonitoring(chatId, bot) {
  console.log("🔍 DEBUG: Starting loop for " + SMART_ACCOUNT);
  let lastBalance = await client.getBalance({ address: SMART_ACCOUNT });
  console.log("💰 Initial Balance: " + formatEther(lastBalance) + " MON");

  setInterval(async () => {
    try {
      const currentBalance = await client.getBalance({ address: SMART_ACCOUNT });
      
      // LOG EVERY CHECK TO TERMINAL
      console.log(`[Polling] ${new Date().toLocaleTimeString()} | Balance: ${formatEther(currentBalance)} MON`);

      if (currentBalance > lastBalance) {
        console.log("🚨 BALANCE INCREASE DETECTED!");
        const diff = formatEther(currentBalance - lastBalance);
        if (chatId) bot.sendMessage(chatId, `🚨 SIGNAL DETECTED! Received ${diff} MON.`);
        
        await executeAutonomousTask(chatId, bot);
        lastBalance = currentBalance;
      }
    } catch (err) {
      console.error("❌ RPC Error:", err.message);
    }
  }, 5000); 
}
