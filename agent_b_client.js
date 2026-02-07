import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

// Agent B - Pulls key from local .env (Secure for GitHub)
const account = privateKeyToAccount(process.env.CLIENT_PRIVATE_KEY);

const client = createWalletClient({
  account,
  chain: { id: 10143, name: 'Monad Testnet', rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } } },
  transport: http()
});

async function hireWorker() {
  console.log("🤖 Agent B: Initiating hire request...");
  try {
    const hash = await client.sendTransaction({
      to: '0x164e7A98fa7Bd34679522c470bF68D66C5b00C66',
      value: parseEther('0.0001')
    });
    console.log("✅ Agent B: Payment Sent! Hash: " + hash);
  } catch (error) {
    console.error("❌ Agent B: Payment failed:", error.message);
  }
}

hireWorker();
