import type { ChatMessage } from "@/types";

export interface AIProvider {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  stream?: boolean;
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export async function streamChat(
  provider: AIProvider,
  request: ChatRequest,
  callbacks: StreamCallbacks
): Promise<AbortController> {
  const controller = new AbortController();

  const url = `${provider.baseUrl.replace(/\/$/, "")}/v1/chat/completions`;

  const body = {
    model: request.model,
    messages: request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    stream: true,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.apiKey) {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败: ${response.status} ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法读取响应流");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          callbacks.onDone();
          return controller;
        }

        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            callbacks.onChunk(delta);
          }
        } catch {
          // 跳过解析失败的行
        }
      }
    }

    callbacks.onDone();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return controller;
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }

  return controller;
}

export async function nonStreamChat(
  provider: AIProvider,
  request: ChatRequest
): Promise<string> {
  const url = `${provider.baseUrl.replace(/\/$/, "")}/v1/chat/completions`;

  const body = {
    model: request.model,
    messages: request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    stream: false,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.apiKey) {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? "";
}
