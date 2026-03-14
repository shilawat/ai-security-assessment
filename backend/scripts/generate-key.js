#!/usr/bin/env node
/**
 * Generate a new customer access key and print the updated ACCESS_KEYS JSON.
 *
 * Usage:
 *   node backend/scripts/generate-key.js "Customer Name"
 *
 * Then paste the printed JSON into your Render ACCESS_KEYS environment variable.
 */
const crypto = require('crypto');

const customerName = process.argv[2];
if (!customerName) {
  console.error('Usage: node generate-key.js "Customer Name"');
  process.exit(1);
}

// Load existing keys from env, or start fresh
let store = {};
try {
  if (process.env.ACCESS_KEYS) store = JSON.parse(process.env.ACCESS_KEYS);
} catch {
  console.error('Warning: could not parse existing ACCESS_KEYS, starting fresh.');
}

const newKey = crypto.randomBytes(24).toString('hex');
store[newKey] = { customer: customerName, active: true, createdAt: new Date().toISOString() };

console.log('\n✅ New access key generated');
console.log('──────────────────────────────────────────');
console.log(`Customer : ${customerName}`);
console.log(`Key      : ${newKey}`);
console.log('\nPaste this into Render → Environment Variables → ACCESS_KEYS:');
console.log('──────────────────────────────────────────');
console.log(JSON.stringify(store));
console.log('──────────────────────────────────────────\n');
