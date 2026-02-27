#!/usr/bin/env node

import { chromium } from 'playwright-core';

async function inspectQwenNetwork() {
  console.log('连接到 Chrome 调试浏览器...');
  
  const response = await fetch('http://127.0.0.1:9222/json/version');
  const versionInfo = await response.json();
  const wsUrl = versionInfo.webSocketDebuggerUrl;
  
  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  
  let page = context.pages().find(p => p.url().includes('qwen.ai'));
  
  if (!page) {
    console.log('未找到 Qwen 页面，请先打开 https://chat.qwen.ai/');
    await browser.close();
    return;
  }
  
  console.log('找到 Qwen 页面:', page.url());
  console.log('\n监听网络请求...');
  console.log('请在浏览器中发送一条消息（建议从 test-messages.txt 中选择），我会捕获 API 请求\n');
  
  // 监听网络请求
  page.on('request', request => {
    const url = request.url();
    if (url.includes('qwen.ai') && (url.includes('api') || url.includes('chat'))) {
      console.log('\n=== 捕获到请求 ===');
      console.log('URL:', url);
      console.log('Method:', request.method());
      console.log('Headers:', JSON.stringify(request.headers(), null, 2));
      if (request.postData()) {
        console.log('Body:', request.postData().substring(0, 500));
      }
    }
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('qwen.ai') && (url.includes('api') || url.includes('chat'))) {
      console.log('\n=== 捕获到响应 ===');
      console.log('URL:', url);
      console.log('Status:', response.status());
      console.log('Headers:', JSON.stringify(response.headers(), null, 2));
      try {
        const text = await response.text();
        console.log('Body preview:', text.substring(0, 500));
      } catch (e) {
        console.log('无法读取响应体');
      }
    }
  });
  
  // 等待 60 秒
  console.log('等待 60 秒...');
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  await browser.close();
}

inspectQwenNetwork().catch(console.error);
