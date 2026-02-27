import type { StreamFn } from "@mariozechner/pi-agent-core";
import {
  createAssistantMessageEventStream,
  type AssistantMessage,
  type TextContent,
} from "@mariozechner/pi-ai";
import { ManusApiClient } from "../providers/manus-api-client.js";

const conversationMap = new Map<string, string>();

export function createManusApiStreamFn(apiKey: string): StreamFn {
  const client = new ManusApiClient({ apiKey });

  return (model, context, streamOptions) => {
    const stream = createAssistantMessageEventStream();

    const run = async () => {
      try {
        const sessionKey = (context as unknown as { sessionId?: string }).sessionId || "default";
        const conversationId = conversationMap.get(sessionKey);

        const messages = context.messages || [];
        const lastUserMessage = [...messages].toReversed().find((m) => m.role === "user");

        let prompt = "";
        if (lastUserMessage) {
          if (typeof lastUserMessage.content === "string") {
            prompt = lastUserMessage.content;
          } else if (Array.isArray(lastUserMessage.content)) {
            prompt = (lastUserMessage.content as TextContent[])
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("");
          }
        }

        if (!prompt) {
          throw new Error("No message found to send to Manus API");
        }

        console.log(`[ManusApiStream] Starting run for session: ${sessionKey}`);
        console.log(`[ManusApiStream] Conversation ID: ${conversationId || "new"}`);

        const agentProfile = model.id?.includes("lite") ? "manus-1.6-lite" : "manus-1.6";
        const text = await client.chat({
          prompt,
          agentProfile,
          taskMode: "chat",
          conversationId: conversationId || undefined,
          signal: streamOptions?.signal,
        });

        const contentParts: TextContent[] = [{ type: "text", text }];
        stream.push({
          type: "text_start",
          contentIndex: 0,
          partial: {
            role: "assistant",
            content: contentParts,
            api: model.api,
            provider: model.provider,
            model: model.id,
            usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
            stopReason: "stop",
            timestamp: Date.now(),
          },
        });
        stream.push({
          type: "text_delta",
          contentIndex: 0,
          delta: text,
          partial: {
            role: "assistant",
            content: contentParts,
            api: model.api,
            provider: model.provider,
            model: model.id,
            usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
            stopReason: "stop",
            timestamp: Date.now(),
          },
        });

        const assistantMessage: AssistantMessage = {
          role: "assistant",
          content: contentParts,
          stopReason: "stop",
          api: model.api,
          provider: model.provider,
          model: model.id,
          usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
          timestamp: Date.now(),
        };

        stream.push({ type: "done", reason: "stop", message: assistantMessage });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        stream.push({
          type: "error",
          reason: "error",
          error: {
            role: "assistant",
            content: [],
            stopReason: "error",
            errorMessage,
            api: model.api,
            provider: model.provider,
            model: model.id,
            usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
            timestamp: Date.now(),
          },
        } as any);
      } finally {
        stream.end();
      }
    };

    queueMicrotask(() => void run());
    return stream;
  };
}
