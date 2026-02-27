# OpenClaw Web 平台扩展 / OpenClaw Web Platform Extension

[中文](#中文) | [English](#english)

---

## 中文

支持 **12 个平台**、**28+ 个模型** 的 AI 对话服务，完全免费使用。

### 支持的平台与模型

| 平台 | 网址 | 模型 | 测试状态 |
|------|------|------|----------|
| **DeepSeek Web** | chat.deepseek.com | DeepSeek V3、DeepSeek R1、V3+Search、R1+Search | ✅ 已测试 |
| **Qwen Web**（千问） | chat.qwen.ai | Qwen 3.5 Plus、Qwen 3.5 Turbo | ✅ 已测试 |
| **Kimi Web** | kimi.moonshot.cn | Moonshot v1 8K、32K、128K | ✅ 已测试 |
| **Claude Web** | claude.ai | Claude 3.5 Sonnet、3 Opus、3 Haiku | 未测试 |
| **ChatGPT Web** | chatgpt.com | GPT-4、GPT-4 Turbo、GPT-3.5 Turbo | 未测试 |
| **Doubao Web** | doubao.com | Doubao-Seed 2.0、Doubao Pro | 未测试 |
| **Yuanbao Web** | yuanbao.tencent.com | Hunyuan Pro、Hunyuan Standard | 未测试 |
| **Gemini Web** (gemini-web) | [https://gemini.google.com/app](https://gemini.google.com/app) | Gemini Pro、Gemini Ultra | 未测试 |
| **Grok Web** | grok.com | Grok 1、Grok 2 | 未测试 |
| **Z Web** | chat.z.ai | GLM-4、GLM-3 Turbo | 未测试 |
| **Manus Web** | manus.im | Manus 1 | 未测试 |
| **Manus API** | api.manus.ai | Manus 1.6、Manus 1.6 Lite（官方 API，支持免费额度） | 未测试 |

### 快速开始

```bash
npm install && npm run build

openclaw gateway stop
./start-chrome-debug.sh   # 单实例，自动打开各平台登录页
./onboard.sh
./server.sh start
```

详见 **START_HERE.md**、**TEST_STEPS.md**。

### 文档

- **INSTALLATION.md** - 安装与编译
- **START_HERE.md** - 快速开始
- **TEST_STEPS.md** - 完整测试步骤

### 特性

- ✅ 完全免费（Web 版 + Manus API 免费额度）
- ✅ 统一浏览器方案（attachOnly 复用调试 Chrome）
- ✅ 自动绕过反爬虫
- ✅ 流式响应
- ✅ 最小化配置

### 系统要求

Node.js v18+ | npm 8.x+ | Chrome 最新版 | macOS / Linux / Windows (WSL2)

---

## English

Support for **12 platforms** and **28+ models** with AI conversation services, completely free to use.

### Supported Platforms & Models

| Platform | URL | Models | Tested |
|----------|-----|--------|--------|
| **DeepSeek Web** | chat.deepseek.com | DeepSeek V3, R1, V3+Search, R1+Search | ✅ Yes |
| **Qwen Web** | chat.qwen.ai | Qwen 3.5 Plus, Qwen 3.5 Turbo | ✅ Yes |
| **Kimi Web** | kimi.moonshot.cn | Moonshot v1 8K, 32K, 128K | ✅ Yes |
| **Claude Web** | claude.ai | Claude 3.5 Sonnet, 3 Opus, 3 Haiku | Untested |
| **ChatGPT Web** | chatgpt.com | GPT-4, GPT-4 Turbo, GPT-3.5 Turbo | Untested |
| **Doubao Web** | doubao.com | Doubao-Seed 2.0, Doubao Pro | Untested |
| **Yuanbao Web** | yuanbao.tencent.com | Hunyuan Pro, Hunyuan Standard | Untested |
| **Gemini Web** (gemini-web) | [https://gemini.google.com/app](https://gemini.google.com/app) | Gemini Pro, Gemini Ultra | Untested |
| **Grok Web** | grok.com | Grok 1, Grok 2 | Untested |
| **Z Web** | chat.z.ai | GLM-4, GLM-3 Turbo | Untested |
| **Manus Web** | manus.im | Manus 1 | Untested |
| **Manus API** | api.manus.ai | Manus 1.6, Manus 1.6 Lite (official API, free tier) | Untested |

### Quick Start

```bash
npm install && npm run build

openclaw gateway stop
./start-chrome-debug.sh
./onboard.sh
./server.sh start
```

See **START_HERE.md**, **TEST_STEPS.md** for details.

### Docs

- **INSTALLATION.md** - Install & build
- **START_HERE.md** - Quick start
- **TEST_STEPS.md** - Testing steps

### Features

- ✅ Free (Web versions + Manus API free tier)
- ✅ Unified browser approach (attachOnly reuses debug Chrome)
- ✅ Auto anti-bot bypass
- ✅ Streaming responses
- ✅ Minimal configuration

### Requirements

Node.js v18+ | npm 8.x+ | Chrome latest | macOS / Linux / Windows (WSL2)
