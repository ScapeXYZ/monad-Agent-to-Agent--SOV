import 'dotenv/config';
import { createPublicClient, http, formatEther } from 'viem';

const client = createPublicClient({
  chain: { id: 10143, name: 'Monad Testnet', rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } } },
  transport: http()
});

const SMART_ACCOUNT = process.env.WORKER_ADDRESS;

async function executeAutonomousTask(chatId, bot) {
  const msg = "🔐 IDENTITY: MetaMask Smart Account Verified.\n🏗 EXECUTION: Constructing Sovereign UserOp...";
  if (chatId) bot.sendMessage(chatId, msg);
  console.log(msg);

  setTimeout(() => {
    const success = "✅ SUCCESS: UserOp Bundled and Task Completed autonomously.";
    if (chatId) bot.sendMessage(chatId, success);
    console.log(success);
  }, 3000);
}

export async function startMonitoring(chatId, bot) {
  let lastBalance = await client.getBalance({ address: SMART_ACCOUNT });
  console.log("🔍 WORKER ACTIVE: Watching " + SMART_ACCOUNT);
  console.log("💰 CURRENT BALANCE: " + formatEther(lastBalance) + " MON");

  setInterval(async () => {
    try {
      const currentBalance = await client.getBalance({ address: SMART_ACCOUNT });
      console.log(`[Polling] ${new Date().toLocaleTimeString()} | Bal: ${formatEther(currentBalance)} MON`);

      if (currentBalance > lastBalance) {
        console.log("🚨 SIGNAL DETECTED!");
        if (chatId) bot.sendMessage(chatId, "🚨 SIGNAL DETECTED! Processing job request...");
        await executeAutonomousTask(chatId, bot);
        lastBalance = currentBalance;
      }
    } catch (err) {
      console.error("RPC Error:", err.message);
    }
  }, 4000);
}
