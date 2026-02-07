import 'dotenv/config';
import { createPublicClient, http, formatEther } from 'viem';

const client = createPublicClient({
  chain: { id: 10143, name: 'Monad Testnet', rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } } },
  transport: http(),
  pollingInterval: 1000 // Fast polling for demo
});

const SMART_ACCOUNT = process.env.WORKER_ADDRESS;

async function executeAutonomousTask(chatId, bot) {
  const notify = (msg) => {
    if (chatId) bot.sendMessage(chatId, msg);
    console.log(msg);
  };
  
  notify("🔐 Identity: MetaMask Smart Account Detected.");
  notify("🏗 Constructing UserOperation for Monad Testnet...");
  
  // Real-world demo: simulate the UserOp bundling time
  setTimeout(() => {
    notify("✅ UserOp Signed & Bundled.\nStatus: Sovereign Execution Successful.\nHash: 0x7ca4...demo_hash");
  }, 3000);
}

export async function startMonitoring(chatId, bot) {
  // Use blockTag: 'pending' to capture the latest "unconfirmed" state for speed
  let lastBalance = await client.getBalance({ address: SMART_ACCOUNT, blockTag: 'pending' });
  console.log("🔍 AGENT ACTIVE: Watching " + SMART_ACCOUNT);
  console.log("💰 Start Balance: " + formatEther(lastBalance) + " MON");

  setInterval(async () => {
    try {
      const currentBalance = await client.getBalance({ address: SMART_ACCOUNT, blockTag: 'pending' });
      
      // Print every poll to terminal for demo proof
      console.log(`[Polling] ${new Date().toLocaleTimeString()} | Current: ${formatEther(currentBalance)} MON`);

      if (currentBalance > lastBalance) {
        const diff = formatEther(currentBalance - lastBalance);
        const signalMsg = `🚨 SIGNAL DETECTED! Received ${diff} MON.`;
        
        if (chatId) bot.sendMessage(chatId, signalMsg);
        await executeAutonomousTask(chatId, bot);
        
        lastBalance = currentBalance;
      }
    } catch (err) {
      console.error("RPC Error:", err.message);
    }
  }, 3000); // 3-second cycle
}
