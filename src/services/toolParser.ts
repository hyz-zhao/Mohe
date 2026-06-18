import type { ToolCall } from "./toolRegistry";

/**
 * 工具调用解析器
 * 从 LLM 输出中提取工具调用 JSON
 */

/**
 * 从 LLM 响应中解析工具调用
 * 支持多种格式：
 * 1. 纯 JSON: {"name": "search", "arguments": {...}}
 * 2. JSON 数组: [{"name": "search", "arguments": {...}}, ...]
 * 3. 代码块中的 JSON: ```json {...} ```
 * 4. 文本中嵌入的 JSON
 */
export function parseToolCalls(content: string): ToolCall[] {
  const calls: ToolCall[] = [];

  // 尝试提取 JSON 对象或数组
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)```|(\[[\s\S]*?\])|(\{[\s\S]*?\})/g;
  let match;

  while ((match = jsonRegex.exec(content)) !== null) {
    const jsonStr = (match[1] || match[2] || match[3]).trim();
    try {
      const parsed = JSON.parse(jsonStr);

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const call = normalizeToolCall(item);
          if (call) calls.push(call);
        }
      } else if (typeof parsed === "object" && parsed !== null) {
        // 检查是否是单个工具调用
        if (parsed.name && typeof parsed.name === "string") {
          const call = normalizeToolCall(parsed);
          if (call) calls.push(call);
        }
        // 检查是否是 tool_calls 数组（OpenAI 格式）
        else if (parsed.tool_calls && Array.isArray(parsed.tool_calls)) {
          for (const tc of parsed.tool_calls) {
            const call = normalizeOpenAIToolCall(tc);
            if (call) calls.push(call);
          }
        }
      }
    } catch {
      // 跳过解析失败的块
    }
  }

  // 如果没有从代码块中提取到，尝试从纯文本中提取
  if (calls.length === 0) {
    const textJsonRegex = /\{"name"\s*:\s*"([^"]+)"\s*,\s*"arguments"\s*:\s*(\{[^}]*\})\}/g;
    while ((match = textJsonRegex.exec(content)) !== null) {
      try {
        const name = match[1];
        const args = JSON.parse(match[2]);
        calls.push({
          id: generateToolCallId(),
          name,
          arguments: args,
        });
      } catch {
        // 跳过
      }
    }
  }

  return calls;
}

function normalizeToolCall(obj: Record<string, unknown>): ToolCall | null {
  if (!obj.name || typeof obj.name !== "string") return null;
  return {
    id: (obj.id as string) || generateToolCallId(),
    name: obj.name,
    arguments: (obj.arguments as Record<string, unknown>) || {},
  };
}

function normalizeOpenAIToolCall(obj: Record<string, unknown>): ToolCall | null {
  if (!obj.function || typeof obj.function !== "object") return null;
  const fn = obj.function as Record<string, unknown>;
  if (!fn.name || typeof fn.name !== "string") return null;
  let args: Record<string, unknown> = {};
  if (typeof fn.arguments === "string") {
    try {
      args = JSON.parse(fn.arguments);
    } catch {
      args = {};
    }
  }
  return {
    id: (obj.id as string) || generateToolCallId(),
    name: fn.name,
    arguments: args,
  };
}

function generateToolCallId(): string {
  return "call_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * 将工具调用结果格式化为 LLM 可读的文本
 */
export function formatToolResults(results: Array<{ name: string; success: boolean; output: string; error?: string }>): string {
  return results
    .map((r) => {
      if (r.success) {
        return `[${r.name}] 执行成功:\n${r.output}`;
      }
      return `[${r.name}] 执行失败: ${r.error || "未知错误"}`;
    })
    .join("\n\n");
}
