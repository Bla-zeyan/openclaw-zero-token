# OpenClaw Web 平台扩展 / OpenClaw Web Platform Extension

[中文](#中文) | [English](#english)

---

## 中文

支持 10 个 Web 平台的 AI 对话服务，完全免费使用。

---

## 中文

支持 10 个 Web 平台的 AI 对话服务，完全免费使用。

### 🎯 支持的平台

#### 已测试平台（2 个）
- ✅ **Claude Web** - claude.ai
- ✅ **Doubao Web** - doubao.com

#### 新增平台（8 个）
- 🆕 **ChatGPT Web** - chatgpt.com
- 🆕 **Qwen Web** - chat.qwen.ai
- 🆕 **Yuanbao Web** - yuanbao.tencent.com
- 🆕 **Kimi Web** - kimi.moonshot.cn
emini.google.com
- 🆕 **Grok Web** - grok.com
- 🆕 **Z Web** - chat.z.ai
- 🆕 **Manus Web** - manus.im

**总计：10 个平台，23 个模型**

### 🚀 快速开始

#### ⚠️ 重要：首次使用必须先编译

如果你是首次下载代码，或者修改了源代码，必须先执行编译步骤：

```bash
# 安装依赖
npm install

# 编译代码
npm run build
```

**验证编译成功**：
```bash
ls dist/index.mjs
# 应该看到文件存在
```

详细安装指南：**INSTALLATION.md**

#### 1. 安装

```bash
npm install
npm run build
```

#### 2. 测试

```bash
# 关闭系统 Gateway
openclaw gateway stop

# 启动 Chrome 调试
./start-chrome-debug.sh

# 配置认证
./onboard.sh

# 启动 Web UI
./server.sh start
```

详细测试步骤：**START_HERE.md** 或 **TEST_STEPS.md**

### 📚 文档

#### 必读文档
1. 首次使用）
2. **START_HERE.md** - 快速开始
3. **TEST_STEPS.md** - 完整测试步骤

### 🏗️ 技术架构

#### 统一的浏览器方案

所有平台都采用相同的架构：

1. **使用 Playwright** 连接到 Chrome 调试浏览器
2. **在浏览器上下文中执行请求** (`page.evaluate()`)
3. **自动绕过反爬虫检测** (Cloudflare, 验证码等)
4. **最小化配置参数** (只需 cookie/token)

#### 代码结构

每个平台包含 4 个核心文件：

```
src/
├── providers/
│   ├── {platform}-web-client-browser.ts  # 浏览器客户端
│   └── {platform}-web-auth.ts            # 认证处理
├── agents/
│   └── {platform}-web-stream.ts          # 流式响应
└── commands/
atform}-web.ts  # 认证配置
```

### 📊 统计数据

- **平台数量**: 10 个
- **模型数量**: 23 个
- **代码文件**: 32 个核心文件
- **代码行数**: 约 4000 行
- **配置文件**: 6 个

### 🎯 特性

- ✅ 完全免费（使用 Web 版本）
- ✅ 统一的浏览器方案
- ✅ 自动绕过反爬虫
- ✅ 流式响应支持
- ✅ 最小化配置
- ✅ 易于扩展

### 🔧 系统要求

- **Node.js**: v18 或更高
- **npm**: 8.x 或更高
- **Google Chrome**: 最新版本
- **操作系统**: macOS, Linux, Windows (WSL2)

### 🤝 贡献

欢迎贡献代码！添加新平台只需：

1. 创建 4 个核心文件（参考现有平台）
2. 更新配置文件
3. 添加 API 类型定义
4. 编译并测试

### 🎉 开始使用

阅读 **START_HERE.md** 开始你的第一次测试！

---

## English

Support for 10 Web platforms with AI conversation services, completely free to use.

### 🎯 Supported Platforms

#### Tested Platforms (2)
- ✅ **Claude Web** - claude.ai
- ✅ **Doubao Web** - doubao.com

#### New Platforms (8)
- 🆕 **ChatGPT Web** - chatgpt.com
- 🆕 **Qwen Web** - chat.qwen.ai
- 🆕 **Yuanbao Web** - yuanbao.tencent.com
- 🆕 **Kimi Web** - kimi.moonshot.cn
- 🆕 **Gemini Web** - gemini.google.com
- 🆕 **Grok Web** - grok.com
- 🆕 **Z Web** - chat.z.ai
- 🆕 **Manus Web** - manus.im

**Tatforms, 23 models**

### 🚀 Quick Start

#### ⚠️  for First Use

If this is your first time downloading the code, or if you've modified the source code, you must build first:

```bash
# Install dependencies
npm install

# Build the code
npm run build
```
## 🎉 开始使用

阅读 **START_HERE.md** 开始你的第一次测试！

---

## English

Support for 10 Web platforms with AI conversation services, completely free to use.

### 🎯 Supported Platforms

#### Tested Platforms (2)
- ✅ **Claude Web** - claude.ai
- ✅ **Doubao Web** - doubao.com

#### New Platforms (8)
- 🆕 **ChatGPT Web** - chatgpt.com
- 🆕 **Qwen Web** - chat.qwen.ai
- 🆕 **Yuanbao Web** - yuanbao.tencent.com
- 🆕 **Kimi Web** - kimi.moonshot.cn
- 🆕 **Gemini Web** - gemini.google.com
- 🆕 **Grok Web** - grok.com
- 🆕 **Z Web** - chat.z.ai
- 🆕 **Manus Web** - manus.im

**Total: 10 platforms, 23 models**

### 🚀 Quick Start

#### ⚠️ Important: Build Required for First Use

```bash
npm install
npm run build
```

**Verify**: `ls dist/index.mjs`

See **INSTALLATION.md** for details.

#### 1. Installation

```bash
npm install
npm run build
```

#### 2. Testing

```bash
openclaw gateway stop
./start-chrome-debug.sh
./onboard.sh
./server.sh start
```

See **START_HERE.md** or **TEST_STEPS.md** for details.

### 📚 Documentation

1. **INSTALLATION.md** - Installation guide
2. **START_HERE.md** - Quick start
3. **TEST_STEPS.md** - Complete testing steps

### 🏗️ Technical Architecture

#### Unified Browser Approach

1. Use Playwright to connect to Chrome debug browser
2. Execute requests in browser context (`page.evaluate()`)
3. Automatically bypass anti-bot detection
4. Minimize configuration (only cookie/token needed)

#### Code Structure

```
src/
├── providers/
│   ├── {platform}-web-client-browser.ts  # Browser client
│   └── {platform}-web-auth.ts            # Authentication
├── agents/
│   └── {platform}-web-stream.ts          # Streaming
└── commands/
    └── auth-choice.apply.{platform}-web.ts  # Config
```

### 📊 Statistics

- **Platforms**: 10
- **Models**: 23
- **Core Files**: 32
- **Lines of Code**: ~4000
- **Config Files**: 6

### 🎯 Features

- ✅ Completely free (Web versions)
- ✅ Unified browser approach
- ✅ Automatic anti-bot bypass
- ✅ Streaming response support
- ✅ Minimal configuration
- ✅ Easy to extend

### 🔧 System Requirements

- **Node.js**: v18+
- **npm**: 8.x+
- **Google Chrome**: Latest
- **OS**: macOS, Linux, Windows (WSL2)

### 🤝 Contributing

To add a new platform:

1. Create 4 core files (refer to existing platforms)
2. Update configuration files
3. Add API type definitions
4. Build and test

### 🎉 Get Started

Read **START_HERE.md** to begin!
ls dist/index.mjs
# Should see the file exists
```

Detailed installation guide: **INSTALLATION.md**

API type definitions
4. Build and test

### 🎉 Get Started

Read **START_HERE.md** to begin your first test!


### 🎯 Features

- ✅ Completely free (using Web versions)
- ✅ Unified browser approach
- ✅ Automatic anti-bot bypass
- ✅ Streaming response support
- ✅ Minimal configuration
- ✅ Easy to extend

### 🔧 System Requirements

- **Node.js**: v18 or higher
- **npm**: 8.x or higher
- **Google Chrome**: Latest version
- **OS**: macOS, Linux, Windows (WSL2)

### 🤝 Contributing

Contributions welcome! To add a new platform:

1. Create 4 core files (refer to existing platforms)
2. Update configuration files
3. Add iles**: 32
- **Lines of Code**: ~4000
- **Config Files**: 6oudflare, CAPTCHA, etc.)
4. **Minimize configuration parameters** (only cookie/token needed)

#### Code Structure

Each platform contains 4 core files:

```
src/
├── providers/
│   ├── {platform}-web-client-browser.ts  # Browser client
│   └── {platform}-web-auth.ts            # Authentication
├── agents/
│   └── {platform}-web-stream.ts          # Streaming response
└── commands/
    └── auth-choice.apply.{platform}-web.ts  # Auth config
```

### 📊 Statistics

- **Platforms**: 10
- **Models**: 23
- **Core Ftomatically bypass anti-bot detection** (Clart Web UI
./server.sh start
```

Detailed testing steps: **START_HERE.md** or **TEST_STEPS.md**

### 📚 Documentation

#### Essential Docs
1. **INSTALLATION.md** - Installation guide (first-time users)
2. **START_HERE.md** - Quick start
3. **TEST_STEPS.md** - Complete testing steps

### 🏗️ Technical Architecture

#### Unified Browser Approach

All platforms use the same architecture:

1. **Use Playwright** to connect to Chrome debug browser
2. **Execute requests in browser context** (`page.evaluate()`)
3. **Audebug.sh

# Configure authentication
./onboard.sh

# St#### 1. Installation

```bash
npm install
npm run build
```

#### 2. Testing

```bash
# Stop system Gateway
openclaw gateway stop

# Start Chrome debug mode
./start-chrome-
---

## English

Support for 10 Web platforms with AI conversation services, completely free to use.

### 🎯 Supported Platforms

#### Tested Platforms (2)
- ✅ **Claude Web** - claude.ai
- ✅ **Doubao Web** - doubao.com

#### New Platforms (8)
- 🆕 **ChatGPT Web** - chatgpt.com
- 🆕 **Qwen Web** - chat.qwen.ai
- 🆕 **Yuanbao Web** - yuanbao.tencent.com
- 🆕 **Kimi Web** - kimi.moonshot.cn
- 🆕 **Gemini Web** - gemini.google.com
- 🆕 **Grok Web** - grok.com
- 🆕 **Z Web** - chat.z.ai
- 🆕 **Manus Web** - manus.im

**Total: 10 platforms, 23 models**

### 🚀 Quick Start

#### ⚠️ Important: Build Required for First Use

If this is your first time downloading the code, or if you've modified the source code, you must build first:

```bash
# Install dependencies
npm install

# Build the code
npm run build
```

**Verify build success**:
```bash
ls dist/index.mjs
# Should see the file exists
```

Detailed installation guide: **INSTALLATION.md**

#### 1. Installation

```bash
npm install
npm run build
```

#### 2. Testing

```bash
# Stop system Gateway
openclaw gateway stop

# Start Chrome debug mode
./start-chrome-debug.sh

# Configure authentication
./onboard.sh

# Start Web UI
./server.sh start
```

Detailed testing steps: **START_HERE.md** or **TEST_STEPS.md**

### 📚 Documentation

#### Essential Docs
1. **INSTALLATION.md** - Installation guide (first-time users)
2. **START_HERE.md** - Quick start
3. **TEST_STEPS.md** - Complete testing steps

### 🏗️ Technical Architecture

#### Unified Browser Approach

All platforms use the same architecture:

1. **Use Playwright** to connect to Chrome debug browser
2. **Execute requests in browser context** (`page.evaluate()`)
3. **Automatically bypass anti-bot detection** (Cloudflare, CAPTCHA, etc.)
4. **Minimize configuration parameters** (only cookie/token needed)

#### Code Structure

Each platform contains 4 core files:

```
src/
├── providers/
│   ├── {platform}-web-client-browser.ts  # Browser client
│   └── {platform}-web-auth.ts            # Authentication
├── agents/
│   └── {platform}-web-stream.ts          # Streaming response
└── commands/
    └── auth-choice.apply.{platform}-web.ts  # Auth config
```

### 📊 Statistics

- **Platforms**: 10
- **Models**: 23
- **Core Files**: 32
- **Lines of Code**: ~4000
- **Config Files**: 6

### 🎯 Features

- ✅ Completely free (using Web versions)
- ✅ Unified browser approach
- ✅ Automatic anti-bot bypass
- ✅ Streaming response support
- ✅ Minimal configuration
- ✅ Easy to extend

### 🔧 System Requirements

- **Node.js**: v18 or higher
- **npm**: 8.x or higher
- **Google Chrome**: Latest version
- **OS**: macOS, Linux, Windows (WSL2)

### 🤝 Contributing

Contributions welcome! To add a new platform:

1. Create 4 core files (refer to existing platforms)
2. Update configuration files
3. Add API type definitions
4. Build and test

### 🎉 Get Started

Read **START_HERE.md** to begin your first test!

---

## English

Support for 10 Web platforms with AI conversation services, completely free to use.

### 🎯 Supported Platforms

#### Tested Platforms (2)
- ✅ **Claude Web** - claude.ai
- ✅ **Doubao Web** - doubao.com

#### New Platforms (8)
- 🆕 **ChatGPT Web** - chatgpt.com
- 🆕 **Qwen Web** - chat.qwen.ai
- 🆕 **Yuanbao Web** - yuanbao.tencent.com
- 🆕 **Kimi Web** - kimi.moonshot.cn
- 🆕 **Gemini Web** - gemini.google.com
- 🆕 **Grok Web** - grok.com
- 🆕 **Z Web** - chat.z.ai
- 🆕 **Manus Web** - manus.im

**Total: 10 platforms, 23 models**

### 🚀 Quick Start

#### ⚠️ Important: Build Required for First Use

```bash
npm install
npm run build
```

**Verify**: `ls dist/index.mjs`

See **INSTALLATION.md** for details.

#### 1. Installation

```bash
npm install
npm run build
```

#### 2. Testing

```bash
openclaw gateway stop
./start-chrome-debug.sh
./onboard.sh
./server.sh start
```

See **START_HERE.md** or **TEST_STEPS.md** for details.

### 📚 Documentation

1. **INSTALLATION.md** - Installation guide
2. **START_HERE.md** - Quick start
3. **TEST_STEPS.md** - Complete testing steps

### 🏗️ Technical Architecture

#### Unified Browser Approach

1. Use Playwright to connect to Chrome debug browser
2. Execute requests in browser context (`page.evaluate()`)
3. Automatically bypass anti-bot detection
4. Minimize configuration (only cookie/token needed)

#### Code Structure

```
src/
├── providers/
│   ├── {platform}-web-client-browser.ts  # Browser client
│   └── {platform}-web-auth.ts            # Authentication
├── agents/
│   └── {platform}-web-stream.ts          # Streaming
└── commands/
    └── auth-choice.apply.{platform}-web.ts  # Config
```

### 📊 Statistics

- **Platforms**: 10
- **Models**: 23
- **Core Files**: 32
- **Lines of Code**: ~4000
- **Config Files**: 6

### 🎯 Features

- ✅ Completely free (Web versions)
- ✅ Unified browser approach
- ✅ Automatic anti-bot bypass
- ✅ Streaming response support
- ✅ Minimal configuration
- ✅ Easy to extend

### 🔧 System Requirements

- **Node.js**: v18+
- **npm**: 8.x+
- **Google Chrome**: Latest
- **OS**: macOS, Linux, Windows (WSL2)

### 🤝 Contributing

To add a new platform:

1. Create 4 core files (refer to existing platforms)
2. Update configuration files
3. Add API type definitions
4. Build and test

### 🎉 Get Started

Read **START_HERE.md** to begin!

---

## English

Support for 10 Web platforms with AI conversation services, completely free to use.

### 🎯 Supported Platforms

#### Tested (2) + New (8) = Total: 10 platforms, 23 models

- ✅ Claude Web, Doubao Web
- 🆕 ChatGPT, Qwen, Yuanbao, Kimi, Gemini, Grok, Z, Manus

### 🚀 Quick Start

```bash
# Build (first time)
npm install && npm run build

# Test
openclaw gateway stop
./start-chrome-debug.sh
./onboard.sh
./server.sh start
```

See **START_HERE.md** for details.

### 📚 Docs

1. **INSTALLATION.md** - Installation
2. **START_HERE.md** - Quick start
3. **TEST_STEPS.md** - Testing steps

### 🏗️ Architecture

Unified browser approach using Playwright:
- Connect to Chrome debug browser
- Execute in browser context
- Auto bypass anti-bot
- Minimal config (cookie/token only)

### 🎯 Features

✅ Free | ✅ Unified | ✅ Anti-bot bypass | ✅ Streaming | ✅ Minimal config | ✅ Extensible

### 🔧 Requirements

Node.js v18+ | npm 8.x+ | Chrome latest | macOS/Linux/Windows(WSL2)

### 🎉 Get Started

Read **START_HERE.md** to begin!
