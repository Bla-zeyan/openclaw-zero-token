#!/usr/bin/env node

import { chromium } from 'playwright-core';

async function findQwenAPI() {
  console.log('连接到 Chrome 调试浏览器...');
  
  const response = await fetch('http://127.0.0.1:9222/json/version');
  const versionInfo = await response.json();
  const wsUrl = versionInfo.webSocketDebuggerUrl;
  
  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  
  let page = context.pages().find(p => p.url().includes('qwen.ai'));
  
  if (!page) {
    console.log('创建新的 Qwen 页面...');
    page = await context.newPage();
    await page.goto('https://chat.qwen.ai/', { waitUntil: 'networkidle' });
  } else {
    console.log('找到现有的 Qwen 页面');
  }
  
  console.log('当前 URL:', page.url());
  console.log('\n分析页面，查找 API 配置...\n');
  
  // 在页面中查找 API 相关的配置
  const apiInfo = await page.evaluate(() => {
    const results = {
      windowKeys: [],
      apiEndpoints: [],
      configObjects: [],
    };
    
    // 查找 window 对象中的 API 相关属性
    for (const key in window) {
      if (key.toLowerCase().includes('api') || 
          key.toLowerCase().includes('config') ||
          key.toLowerCase().includes('qwen')) {
        try {
          const value = window[key];
          if (value && typeof value === 'object') {
            results.windowKeys.push({
              key,
              type: typeof value,
              keys: Object.keys(value).slice(0, 10),
            });
          }
        } catch (e) {
          // ignore
        }
      }
    }
    
    // 查找所有的 script 标签
    const scripts = Array.from(document.querySelectorAll('script'));
    for (const script of scripts) {
      const content = script.textContent || '';
      
      // 查找 API 端点
      const apiMatches = content.match(/["'](\/api\/[^"']+)["']/g);
      if (apiMatches) {
        results.apiEndpoints.push(...apiMatches.map(m => m.replace(/["']/g, '')));
      }
      
      // 查找配置对象
      const configMatches = content.match(/apiUrl\s*[:=]\s*["']([^"']+)["']/g);
      if (configMatches) {
        results.configObjects.push(...configMatches);
      }
    }
    
    // 去重
    results.apiEndpoints = [...new Set(results.apiEndpoints)];
    results.configObjects = [...new Set(results.configObjects)];
    
    return results;
  });
  
  console.log('=== Window 对象中的 API 相关属性 ===');
  console.log(JSON.stringify(apiInfo.windowKeys, null, 2));
  
  console.log('\n=== 发现的 API 端点 ===');
  console.log(JSON.stringify(apiInfo.apiEndpoints, null, 2));
  
  console.log('\n=== 发现的配置对象 ===');
  console.log(JSON.stringify(apiInfo.configObjects, null, 2));
  
  // 尝试查找实际的模型列表
  console.log('\n=== 查找模型配置 ===');
  const models = await page.evaluate(() => {
    const results = [];
    
    // 查找包含 "qwen" 或 "model" 的变量
    for (const key in window) {
      try {
        const value = window[key];
        if (value && typeof value === 'object') {
          const str = JSON.stringify(value);
          if (str.includes('qwen-max') || 
              str.includes('qwen-plus') || 
              str.includes('qwen-turbo')) {
            results.push({
              key,
              value: str.substring(0, 500),
            });
          }
        }
      } catch (e) {
        // ignore
      }
    }
    
    return results;
  });
  
  console.log(JSON.stringify(models, null, 2));
  
  await browser.close();
}

findQwenAPI().catch(console.error);
