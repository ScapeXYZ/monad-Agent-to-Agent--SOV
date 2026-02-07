import 'dotenv/config';
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Agent B Client - Standalone payment sender
 * 
 * This script allows sending payments to the Worker without Telegram.
 * Usage: node agent_b_client.js
 * 
 * Configure via .env file:
 * - CLIENT_PRIVATE_KEY: Your wallet private key
 * - WORKER_ADDRESS: Target smart account address
 * - PAYMENT_AMOUNT: Amount to send (default: 0.0001 MON)
 */

// Load environment
const PRIVATE_KEY = process.env.CLIENT_PRIVATE_KEY;
const WORKER_ADDRESS = process.env.WORKER_ADDRESS || '0x164e7A98fa7Bd34679522c470bF68D66C5b00C66';
const PAYMENT_AMOUNT = process.env.PAYMENT_AMOUNT || '0.0001';

// Validate
if (!PRIVATE_KEY) {
  console.error("❌ Error: CLIENT_PRIVATE_KEY not set in .env");
  console.error("   Run: echo 'CLIENT_PRIVATE_KEY=0x...' >> .env");
  process.exit(1);
}

// Setup client
const account = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : '0x' + PRIVATE_KEY);
const client = createWalletClient({
  account,
  chain: { id: 10143, name: 'Monad Testnet', rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } } },
  transport: http()
});

console.log("🤖 Agent B Client");
console.log("👤 From:", account.address);
console.log("👷 To:", WORKER_ADDRESS);
console.log("💰 Amount:", PAYMENT_AMOUNT, "MON\n");

async function hireWorker() {
  try {
    const hash = await client.sendTransaction({
      to: WORKER_ADDRESS,
      value: parseEther(PAYMENT_AMOUNT),
      gas: 21000n
    });
    console.log("✅ Payment Sent!");
    console.log("📤 Hash:", hash);
  } catch (error) {
    console.error("❌ Payment failed:", error.message);
  }
}

hireWorker();
