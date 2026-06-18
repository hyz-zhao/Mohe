import { toolRegistry, type ToolCall, type ToolResult } from "./toolRegistry";
import { formatToolResults } from "./toolParser";

export interface ExecutorOptions {
  /** 单个工具执行超时（毫秒） */
  timeout?: number;
  /** 最大并行执行数 */
  maxConcurrency?: number;
}

const DEFAULT_OPTIONS: Required<ExecutorOptions> = {
  timeout: 30000,
  maxConcurrency: 5,
};

/**
 * 带超时控制的工具执行
 */
async function executeWithTimeout(
  toolCall: ToolCall,
  timeout: number
): Promise<ToolResult> {
  const timeoutPromise = new Promise<ToolResult>((_, reject) => {
    setTimeout(() => reject(new Error(`工具 "${toolCall.name}" 执行超时 (${timeout}ms)`)), timeout);
  });

  try {
    return await Promise.race([toolRegistry.execute(toolCall), timeoutPromise]);
  } catch (error) {
    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      success: false,
      output: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 并行执行工具调用（带并发限制）
 */
export async function executeToolCalls(
  toolCalls: ToolCall[],
  options?: ExecutorOptions
): Promise<ToolResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const results: ToolResult[] = [];

  // 分批并行执行
  for (let i = 0; i < toolCalls.length; i += opts.maxConcurrency) {
    const batch = toolCalls.slice(i, i + opts.maxConcurrency);
    const batchResults = await Promise.all(
      batch.map((tc) => executeWithTimeout(tc, opts.timeout))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * 将工具执行结果格式化为文本，用于注入 LLM 上下文
 */
export function summarizeToolResults(results: ToolResult[]): string {
  return formatToolResults(
    results.map((r) => ({
      name: r.name,
      success: r.success,
      output: r.output,
      error: r.error,
    }))
  );
}
