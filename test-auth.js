#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';

// 模拟环境变量
process.env.OPENCLAW_CONFIG_PATH = '/Users/linux/Documents/trae_projects/openclawWeComzh/.openclaw-state/openclaw.json';
process.env.OPENCLAW_STATE_DIR = '/Users/linux/Documents/trae_projects/openclawWeComzh/.openclaw-state';

// 导入必要的模块
const { resolveAuthProfileOrder } = await import('./dist/agents/auth-profiles/order.mjs');
const { ensureAuthProfileStore } = await import('./dist/agents/auth-profiles/store.mjs');
const { listProfilesForProvider } = await import('./dist/agents/auth-profiles/profiles.mjs');

console.log('=== Testing auth profile loading ===');

// 加载认证存储
const store = ensureAuthProfileStore();
console.log('Store loaded successfully');
console.log('All profiles:', Object.keys(store.profiles));

// 测试 listProfilesForProvider
const deepseekProfiles = listProfilesForProvider(store, 'deepseek-web');
console.log('DeepSeek profiles:', deepseekProfiles);

// 测试 resolveAuthProfileOrder
const order = resolveAuthProfileOrder({
  store,
  provider: 'deepseek-web'
});
console.log('Auth profile order:', order);

// 检查认证文件路径
const authPath = path.join(process.env.OPENCLAW_STATE_DIR, 'agents', 'main', 'agent', 'auth-profiles.json');
console.log('Auth file path:', authPath);
console.log('Auth file exists:', fs.existsSync(authPath));

if (fs.existsSync(authPath)) {
  const authContent = fs.readFileSync(authPath, 'utf8');
  const authData = JSON.parse(authContent);
  console.log('Auth file content:', JSON.stringify(authData, null, 2));
}
