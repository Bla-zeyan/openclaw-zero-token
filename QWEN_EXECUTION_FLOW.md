# Qwen Web 执行流程详解

## 1. 启动阶段

### 1.1 Chrome 调试模式启动
```bash
./start-chrome-debug.sh
```
- 启动 Chrome，监听端口 9222 (CDP - Chrome DevTools Protocol)
- 打开 https://chat.qwen.ai/
- 用户已登录，Cookie 保存在浏览器中

### 1.2 Gateway 启动
```bash
./server.sh  # 或 ./openclaw.mjs gateway
```

**文件**: `src/index.ts` → `dist/index.mjs`

**流程**:
1. 加载配置文件 `.openclaw-state/openclaw.json`
2. 读取 `agents.defaults.model.primary: "qwen-web/qwen3.5-plus"`
3. 解析模型引用: `provider=qwen-web`, `modelId=qwen3.5-plus`
4. 启动 WebSocket 服务器 (端口 3001)
5. 启动 WebUI (http://127.0.0.1:3001)

---

## 2. 配置加载流程

### 2.1 模型提供商注册

**文件**: `src/agents/models-config.providers.ts`

```typescript
// 定义 Qwen Web 常量
export const QWEN_WEB_BASE_URL = "https://chat.qwen.ai";
export const QWEN_WEB_DEFAULT_MODEL_ID = "qwen-max";

// 构建 Qwen Web 提供商配置
export async function buildQwenWebProvider(): Promise<ProviderConfig> {
  return {
    baseUrl: QWEN_WEB_BASE_URL,
    api: "qwen-web",  // ← 关键：API 类型标识
    models: [
      {
        id: "qwen-max",
        name: "Qwen Max (Web)",
        contextWindow: 32768,
        maxTokens: 8192,
      },
      {
        id: "qwen-plus",
        name: "Qwen Plus (Web)",
        ...
      },
      {
        id: "qwen-turbo",
        name: "Qwen Turbo (Web)",
        ...
      },
    ],
  };
}
```

### 2.2 隐式提供商解析

**文件**: `src/agents/models-config.providers.ts` → `resolveImplicitProviders()`

```typescript
export async function resolveImplicitProviders(cfg: ModelsConfig) {
  const providers = cfg.providers || {};
  
  // 如果配置中没有 qwen-web，自动添加
  if (!providers["qwen-web"]) {
    const qwenWebKey = resolveEnvApiKey("qwen-web");
    providers["qwen-web"] = {
      ...(await buildQwenWebProvider({ apiKey: qwenWebKey })),
      apiKey: qwenWebKey,
    };
  }
  
  return providers;
}
```

### 2.3 模型目录构建

**文件**: `src/agents/models-config.ts`

```typescript
// 将提供商配置转换为模型定义
function buildModelDefinitions(providerConfig: ProviderConfig): ModelDefinitionConfig[] {
  return providerConfig.models.map(model => ({
    id: model.id,
    name: model.name,
    provider: "qwen-web",
    api: providerConfig.api,  // "qwen-web"
    contextWindow: model.contextWindow,
    maxOutputTokens: model.maxTokens,
  }));
}
```

---

## 3. WebUI 模型列表显示

### 3.1 WebUI 请求模型列表

**WebUI 前端** → **WebSocket 请求** → **Gateway**

```
WebUI: ws://127.0.0.1:3001
  ↓
发送消息: { type: "model.list" }
  ↓
Gateway 处理
```

### 3.2 Gateway 返回模型列表

**文件**: `src/gateway/routes/models.ts` (推测)

```typescript
// 从模型目录获取所有可用模型
const models = await getModelCatalog();

// 返回给 WebUI
return models.map(model => ({
  id: `${model.provider}/${model.id}`,  // "qwen-web/qwen-max"
  name: model.name,                      // "Qwen Max (Web)"
  provider: model.provider,              // "qwen-web"
  api: model.api,                        // "qwen-web"
}));
```

### 3.3 WebUI 显示

WebUI 接收到模型列表后，在下拉菜单中显示：
```
- Claude Web (claude-web/claude-3-5-sonnet-20241022)
- Doubao Browser (doubao-web/doubao-seed-2.0)
- Qwen Max (Web) (qwen-web/qwen-max)  ← 这里！
- Qwen Plus (Web) (qwen-web/qwen-plus)
- ...
```

---

## 4. 用户发送消息流程

### 4.1 WebUI 发送消息

用户在 WebUI 输入消息 "你好" 并选择模型 `qwen-web/qwen-max`

```
WebUI
  ↓
WebSocket 消息: {
  type: "chat.send",
  message: "你好",
  model: "qwen-web/qwen-max",
  session: "default"
}
  ↓
Gateway (ws://127.0.0.1:3001)
```

### 4.2 Gateway 路由到 Agent

**文件**: `src/gateway/routes/chat.ts` (推测)

```typescript
// 解析模型引用
const modelRef = parseModelRef("qwen-web/qwen-max");
// { provider: "qwen-web", modelId: "qwen-max" }

// 查找模型定义
const modelDef = await getModelDefinition(modelRef);
// {
//   id: "qwen-max",
//   provider: "qwen-web",
//   api: "qwen-web",  ← 关键：决定使用哪个 Stream 函数
//   ...
// }

// 创建 Agent 运行
await runAgent({
  model: modelDef,
  messages: [{ role: "user", content: "你好" }],
  session: "default"
});
```

### 4.3 Agent 选择 Stream 函数

**文件**: `src/agents/pi-embedded-runner/run/attempt.ts`

```typescript
import { createQwenWebStreamFn } from "../../qwen-web-stream.js";

// 根据 model.api 选择对应的 Stream 函数
function selectStreamFn(model: ModelDefinitionConfig): StreamFn {
  switch (model.api) {
    case "claude-web":
      return createClaudeWebStreamFn(apiKey);
    case "doubao-web":
      return createDoubaoWebStreamFn(apiKey);
    case "qwen-web":
      return createQwenWebStreamFn(apiKey);  // ← 这里！
    case "chatgpt-web":
      return createChatGPTWebStreamFn(apiKey);
    // ...
  }
}

// 执行 Stream
const streamFn = selectStreamFn(model);
const stream = streamFn(model, context, options);
```

---

## 5. Qwen Web Stream 执行

### 5.1 创建 Stream 函数

**文件**: `src/agents/qwen-web-stream.ts`

```typescript
export function createQwenWebStreamFn(cookieOrJson: string): StreamFn {
  // 创建 Qwen Web 浏览器客户端
  const client = new QwenWebClientBrowser({
    cookie: cookieOrJson,
    userAgent: "Mozilla/5.0"
  });

  return (model, context, streamOptions) => {
    const stream = createAssistantMessageEventStream();

    const run = async () => {
      // 1. 初始化客户端（连接到 Chrome）
      await client.init();

      // 2. 提取用户消息
      const prompt = extractUserMessage(context.messages);
      // "你好"

      // 3. 调用 chatCompletions
      const responseStream = await client.chatCompletions({
        conversationId: undefined,  // 新会话
        message: prompt,            // "你好"
        model: model.id,            // "qwen-max"
        signal: streamOptions?.signal,
      });

      // 4. 读取响应流
      const reader = responseStream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // 解析 SSE 格式: "data: {...}\n\n"
        processChunk(chunk, stream);
      }

      // 5. 完成
      stream.push({ type: "done", message: assistantMessage });
    };

    run();
    return stream;
  };
}
```

---

## 6. Qwen Web 浏览器客户端

### 6.1 初始化 - 连接 Chrome

**文件**: `src/providers/qwen-web-client-browser.ts`

```typescript
export class QwenWebClientBrowser {
  private baseUrl = "https://chat.qwen.ai";
  private browser: BrowserContext | null = null;
  private page: Page | null = null;

  async init() {
    await this.ensureBrowser();
  }

  private async ensureBrowser() {
    // 1. 连接到 Chrome 调试端口
    const wsUrl = await getChromeWebSocketUrl("http://127.0.0.1:9222");
    
    // 2. 使用 Playwright 连接
    this.browser = await chromium.connectOverCDP(wsUrl);

    // 3. 查找已打开的 Qwen 页面
    const pages = this.browser.pages();
    this.page = pages.find(p => p.url().includes('qwen.ai'));
    
    // 4. 如果没有，创建新页面
    if (!this.page) {
      this.page = await this.browser.newPage();
      await this.page.goto('https://chat.qwen.ai/');
    }

    // 5. 添加 Cookie（如果需要）
    await this.browser.addCookies([...]);
  }
}
```

### 6.2 发送消息 - 调用 Qwen API

**文件**: `src/providers/qwen-web-client-browser.ts`

```typescript
async chatCompletions(params: {
  message: string;
  model?: string;
}): Promise<ReadableStream<Uint8Array>> {
  const { page } = await this.ensureBrowser();

  // 映射模型 ID
  const actualModel = this.mapModelId(params.model);
  // "qwen-max" → "qwen3.5-plus"

  // === 步骤 1: 创建会话 ===
  const createChatResult = await page.evaluate(
    async ({ baseUrl }) => {
      const res = await fetch(`${baseUrl}/api/v2/chats/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      return { ok: true, chatId: data.chat_id };
    },
    { baseUrl: this.baseUrl }
  );

  const chatId = createChatResult.chatId;
  // 例如: "abc123-def456-..."

  // === 步骤 2: 发送消息 ===
  const responseData = await page.evaluate(
    async ({ baseUrl, chatId, model, message }) => {
      const url = `${baseUrl}/api/v2/chat/completions?chat_id=${chatId}`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify({
          stream: true,
          version: "2.1",
          incremental_output: true,
          chat_id: chatId,
          chat_mode: "normal",
          model: model,  // "qwen3.5-plus"
          messages: [
            { role: "user", content: message }  // "你好"
          ],
        }),
      });

      // 读取流式响应
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value);
      }

      return { ok: true, data: fullText };
    },
    { baseUrl: this.baseUrl, chatId, model: actualModel, message: params.message }
  );

  // === 步骤 3: 返回流 ===
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(responseData.data));
      controller.close();
    },
  });
}
```

---

## 7. 响应流处理

### 7.1 Qwen API 响应格式

```
data: {"text":"你","sessionId":"abc123"}

data: {"text":"好","sessionId":"abc123"}

data: {"text":"！","sessionId":"abc123"}

data: [DONE]
```

### 7.2 Stream 解析

**文件**: `src/agents/qwen-web-stream.ts`

```typescript
const processLine = (line: string) => {
  if (!line.startsWith("data:")) return;

  const dataStr = line.slice(5).trim();
  if (dataStr === "[DONE]") return;

  const data = JSON.parse(dataStr);

  // 提取文本增量
  const delta = data.text || data.content;
  if (delta) {
    accumulatedContent += delta;

    // 推送到 Stream
    stream.push({
      type: "text_delta",
      delta,
      partial: createPartial(),
    });
  }
};
```

### 7.3 返回给 WebUI

```
Gateway
  ↓
WebSocket 消息流:
  { type: "text_delta", delta: "你" }
  { type: "text_delta", delta: "好" }
  { type: "text_delta", delta: "！" }
  { type: "done", message: { content: "你好！" } }
  ↓
WebUI 实时显示
```

---

## 8. 完整调用链

```
用户输入 "你好" (WebUI)
  ↓
WebSocket → Gateway (ws://127.0.0.1:3001)
  ↓
解析模型: qwen-web/qwen-max
  ↓
查找模型定义 (api: "qwen-web")
  ↓
选择 Stream 函数: createQwenWebStreamFn()
  ↓
创建客户端: QwenWebClientBrowser
  ↓
连接 Chrome (CDP: http://127.0.0.1:9222)
  ↓
查找 Qwen 页面 (https://chat.qwen.ai/)
  ↓
在浏览器上下文中执行 fetch:
  1. POST /api/v2/chats/new → 获取 chat_id
  2. POST /api/v2/chat/completions?chat_id=xxx
     - 请求体: { model: "qwen3.5-plus", messages: [...] }
  ↓
读取 SSE 响应流
  ↓
解析 data: {...} 格式
  ↓
提取文本增量 (delta)
  ↓
推送到 Stream
  ↓
Gateway → WebSocket → WebUI
  ↓
WebUI 实时显示响应
```

---

## 9. 关键文件总结

| 文件 | 作用 |
|------|------|
| `.openclaw-state/openclaw.json` | 配置文件，定义 primary 模型 |
| `src/agents/models-config.providers.ts` | 注册 qwen-web 提供商，定义模型列表 |
| `src/agents/models-config.ts` | 构建模型目录 |
| `src/agents/pi-embedded-runner/run/attempt.ts` | 根据 model.api 选择 Stream 函数 |
| `src/agents/qwen-web-stream.ts` | Qwen Web Stream 实现，调用客户端 |
| `src/providers/qwen-web-client-browser.ts` | Qwen Web 浏览器客户端，执行 API 调用 |
| `src/browser/chrome.ts` | Chrome 连接管理 |

---

## 10. 为什么需要浏览器？

Qwen Web API 需要：
1. **认证 Cookie**: 用户登录后的 Session Cookie
2. **浏览器指纹**: User-Agent, 浏览器特征
3. **动态 Token**: 可能需要从页面 JavaScript 获取

所以我们：
1. 启动 Chrome 调试模式
2. 用户手动登录 https://chat.qwen.ai/
3. 使用 Playwright 连接到已登录的浏览器
4. 在浏览器上下文中执行 `fetch()` 调用 API
5. Cookie 和浏览器特征自动包含在请求中

这样就绕过了直接调用 API 的认证问题！
