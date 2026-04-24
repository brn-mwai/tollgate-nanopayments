// Isolated probe: fetch a 402 from demo-news, sign EIP-3009 TransferWithAuth,
// POST directly to x402.org facilitator, print the response. Tells us
// whether the facilitator accepts our payload without involving Convex.

import { privateKeyToAccount } from "viem/accounts";

const PUBLISHER = process.env.DEMO_PUBLISHER_URL ?? "http://localhost:4001";
const PRIVATE_KEY = process.env.TOLLGATE_AGENT_PRIVATE_KEY;
const FACILITATOR = "https://www.x402.org/facilitator";

if (!PRIVATE_KEY) { console.error("TOLLGATE_AGENT_PRIVATE_KEY missing"); process.exit(1); }

const account = privateKeyToAccount(PRIVATE_KEY);

// 1. Get 402
const cold = await fetch(`${PUBLISHER}/api/articles/arc-primer`);
console.log("402 status:", cold.status);
const quote = await cold.json();
console.log("402 body:", JSON.stringify(quote, null, 2));

const accepted = quote.accepts[0];

// 2. Sign EIP-3009
const domain = {
  name: "USDC",
  version: "2",
  chainId: 84532,
  verifyingContract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};
const types = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
};
const nowSec = BigInt(Math.floor(Date.now() / 1000));
const message = {
  from: account.address,
  to: accepted.payTo,
  value: BigInt(accepted.amount),
  validAfter: 0n,
  validBefore: nowSec + 600n,
  nonce: "0x" + "0".repeat(63) + "1",
};
const signature = await account.signTypedData({
  domain,
  types,
  primaryType: "TransferWithAuthorization",
  message,
});
console.log("signature:", signature);

// 3. POST to facilitator /verify first
const paymentPayload = {
  x402Version: 2,
  scheme: "exact",
  network: "eip155:84532",
  payload: {
    signature,
    authorization: {
      from: message.from,
      to: message.to,
      value: message.value.toString(),
      validAfter: message.validAfter.toString(),
      validBefore: message.validBefore.toString(),
      nonce: message.nonce,
    },
  },
};
const paymentRequirements = {
  scheme: "exact",
  network: "eip155:84532",
  asset: accepted.asset,
  amount: accepted.amount,
  payTo: accepted.payTo,
  maxTimeoutSeconds: 120,
};

const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString("base64");
const reqSpecShape = {
  scheme: "exact",
  network: "eip155:84532",
  maxAmountRequired: accepted.amount,
  resource: accepted.payTo, // URL of the resource in x402, but we use payTo here
  description: "tollgate",
  mimeType: "application/json",
  payTo: accepted.payTo,
  maxTimeoutSeconds: 120,
  asset: accepted.asset,
};

console.log("\n=== A: paymentPayload (object) + paymentRequirements (spec) ===");
let r = await fetch(`${FACILITATOR}/verify`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ paymentPayload, paymentRequirements: reqSpecShape }),
});
console.log("status:", r.status, "body:", (await r.text()).slice(0, 300));

console.log("\n=== B: paymentHeader (base64) + paymentRequirements (spec) ===");
r = await fetch(`${FACILITATOR}/verify`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ paymentHeader, paymentRequirements: reqSpecShape }),
});
console.log("status:", r.status, "body:", (await r.text()).slice(0, 300));

console.log("\n=== C: paymentPayload (object) + accepts array ===");
r = await fetch(`${FACILITATOR}/verify`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ paymentPayload, accepts: [reqSpecShape] }),
});
console.log("status:", r.status, "body:", (await r.text()).slice(0, 300));

console.log("\n=== D: paymentHeader + accepts array ===");
r = await fetch(`${FACILITATOR}/verify`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ paymentHeader, accepts: [reqSpecShape] }),
});
console.log("status:", r.status, "body:", (await r.text()).slice(0, 300));
