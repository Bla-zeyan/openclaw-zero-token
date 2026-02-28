# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在本项目中提供操作指南。

> **重要提示：未来我们的沟通将使用中文。**

## 项目概述

OpenClaw Zero Token 是一个**免 API Token 的多平台 AI 网关**，通过浏览器登录方式捕获会话凭证，实现对各大 AI 平台的免费访问。

### 核心功能

- **免 Token 使用**：通过浏览器自动化（Playwright）登录 DeepSeek、Qwen、Kimi、Claude、豆包等 AI 平台
- **统一 API 网关**：提供 OpenAI 兼容的 API（端口 3001）
- **多渠道接入**：支持 Telegram、Slack、Discord、WhatsApp 等通讯平台
- **Web UI**：浏览器访问 http://127.0.0.1:3001 直接聊天

### 支持的平台

| 平台 | 状态 |
|-----|------|
| DeepSeek Web | ✅ 已测试 |
| 千问 (Qwen) | ✅ 已测试 |
| Kimi | ✅ 已测试 |
| Claude Web | ✅ 已测试 |
| 豆包 (Doubao) | ✅ 已测试 |
| ChatGPT Web | ✅ 已测试 |
| Grok Web | ✅ 已测试 |
| Manus API | ✅ 已测试 |

## 技术栈

- **运行时**: Node 22+ (支持 Bun 用于开发/脚本)
- **语言**: TypeScript (ESM, strict 模式)
- **包管理器**: pnpm
- **构建**: tsdown (输出到 `dist/`)
- **Web UI**: Lit 3.x
- **浏览器自动化**: Playwright CDP
- **测试**: Vitest with V8 coverage

## 核心代码位置

```
src/
├── index.ts                    # 项目入口，CLI 程序入口
├── cli/
│   └── program/                # CLI 命令定义
│       ├── build-program.ts    # CLI 程序构建
│       └── command-registry.ts # 命令注册
├── gateway/                    # HTTP 网关核心
│   ├── index.ts               # Gateway 入口
│   └── server.ts              # Express 服务器
├── providers/                 # AI 平台 Provider（核心业务逻辑）
│   ├── deepseek-web/          # DeepSeek Web 实现
│   │   ├── auth.ts            # 认证/凭证捕获
│   │   └── client.ts          # API 客户端
│   ├── doubao-web/            # 豆包 Web 实现
│   ├── claude-web/            # Claude Web 实现
│   └── qwen-web/              # 千问 Web 实现
├── agents/                    # AI 代理核心（流式响应处理）
├── channels/                  # 消息通讯渠道
└── browser/                   # Playwright 浏览器自动化
```

## 常用命令

### 首次配置（6 步流程）

```bash
# 1. 安装依赖
pnpm install

# 2. 编译项目
pnpm build

# 3. 启动 Chrome 调试模式
./start-chrome-debug.sh

# 4. 登录各大网站（千问、Kimi、Claude 等，不含 DeepSeek）

# 5. 配置认证（捕获凭证）
./onboard.sh

# 6. 登录 DeepSeek（然后在 onboard 中选择 deepseek-web 捕获）

# 7. 启动 Gateway
./server.sh start
```

### 日常使用

```bash
# 启动 Gateway（需要先启动 Chrome 调试）
./server.sh start          # 启动网关 (端口 3001)
./server.sh stop           # 停止网关
./server.sh status         # 查看状态

# 开发运行
pnpm openclaw ...          # CLI 入口点
pnpm dev                   # 开发模式运行
pnpm tui                   # 运行终端 UI

# 代码质量
pnpm check                 # Lint + format + type-check
pnpm format                # 自动格式化
pnpm lint                  # 仅 lint 检查
pnpm tsgo                  # 仅类型检查

# 测试
pnpm test                  # 单元测试
pnpm test:e2e              # E2E 测试
pnpm test:live             # 实时测试
pnpm test:coverage         # 覆盖率报告
pnpm test:watch            # 监听模式
```

## 使用方式

### Web UI

访问 `http://127.0.0.1:3001` 直接在浏览器中聊天。

### API 调用

```bash
curl http://127.0.0.1:3001/v1/chat/completions \
  -H "Authorization: Bearer YOUR_GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-web/deepseek-chat",
    "messages": [{"role": "user", "content": "你好！"}]
  }'
```

### CLI 模式

```bash
pnpm tui
```

### 切换模型

在聊天界面使用 `/model` 命令：

```bash
/model claude-web          # 切换到 Claude
/model doubao-web          # 切换到豆包
/model deepseek-web         # 切换到 DeepSeek
/models                    # 查看所有可用模型
```

## 架构

```
                    ┌─────────────┐
                    │  Web UI     │
                    │ (Lit 3.x)   │
                    └──────┬──────┘
                           │
┌────────────┐    ┌────────▼────────┐    ┌────────────┐
│  Channels  │───▶│     Gateway      │◀───│   CLI/TUI  │
│ (Telegram…)│    │   (Port 3001)   │    │            │
└────────────┘    └────────┬────────┘    └────────────┘
                           │
                    ┌──────▼──────┐
                    │ Agent Core  │
                    │ (PI-AI)     │
                    └──────┬──────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     │                     │                     │
┌────▼────┐          ┌─────▼────┐          ┌────▼────┐
│DeepSeek │          │  Doubao  │          │ Claude  │
│  Web    │          │   Web    │          │  Web    │
└─────────┘          └──────────┘          └─────────┘
     │
     ▼
┌─────────────────────────────────────────────┐
│           Playwright CDP                    │
│      (浏览器自动化 + 凭证捕获)               │
└─────────────────────────────────────────────┘
```

## 防冗余规则

**始终重用现有代码 - 避免重复！**

- 创建新工具前先搜索现有实现
- 使用集中化格式化: `src/infra/format-time` 处理时间格式化
- 使用集中化终端输出: `src/terminal/table.ts`, `src/terminal/theme.ts`
- 单元测试就近放置: `*.test.ts` 放在源文件旁边
- 保持文件在 ~700 行以内

## 关键模式

- **导入约定**: ESM 跨包导入使用 `.js` 后缀
- **类型**: 使用 `import type { X }` 导入仅类型
- **CLI 命令**: `src/commands/`, 通过 `createDefaultDeps` 依赖注入
- **Provider 实现**: `src/providers/` 中的各 AI 平台遵循类似的认证和请求处理模式
- **认证捕获**: 通过 Playwright CDP 监听网络请求，拦截 Authorization Header

## 配置文件

- `openclaw.json`: 主配置文件
- `auth.json`: 存储各平台的认证凭证（位于 `.openclaw-state/`）
- `.openclaw-state/`: 本地状态目录（不提交到 Git）
