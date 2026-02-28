# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在本项目中提供操作指南。

> **重要提示：未来我们的沟通将使用中文。**

## 项目概述

OpenClaw Zero Token 是一个多平台 AI 网关，通过浏览器自动化（Playwright）和 API 集成，为各种 AI 平台（DeepSeek、Qwen、Kimi、Claude、Doubao、ChatGPT、Grok、Gemini、Manus）提供统一访问。

## 技术栈

- **运行时**: Node 22+ (支持 Bun 用于开发/脚本)
- **语言**: TypeScript (ESM, strict 模式)
- **包管理器**: pnpm
- **构建**: tsdown (输出到 `dist/`)
- **Web UI**: Lit 3.x
- **测试**: Vitest with V8 coverage

## 常用命令

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 开发运行
pnpm openclaw ...          # CLI 入口点
pnpm dev                   # 开发模式运行
pnpm tui                   # 运行终端 UI

# 运行网关服务器
./server.sh start          # 启动网关 (端口 3001)
./server.sh stop           # 停止网关
./server.sh status         # 查看状态

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

## 架构

```
src/
├── agents/       # AI 代理核心 (PI-AI 引擎)
├── providers/    # AI 平台集成 (DeepSeek, Qwen, Claude 等)
├── gateway/      # HTTP 网关 (Express 5.x, 端口 3001)
├── channels/     # 消息通讯 (Telegram, Slack, Discord, LINE, WhatsApp)
├── cli/          # CLI 框架
├── commands/     # CLI 命令
├── config/       # 配置管理
├── browser/      # Playwright 浏览器自动化
├── hooks/        # 代理生命周期钩子
├── memory/       # 代理记忆系统
├── plugins/      # 插件 SDK
├── tui/          # 终端 UI
└── web/          # Web 组件
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
