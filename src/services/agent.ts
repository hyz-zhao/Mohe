import type { AIProvider } from "./ai";
import { parseToolCalls } from "./toolParser";
import { executeToolCalls, summarizeToolResults } from "./toolExecutor";
import { toolRegistry } from "./toolRegistry";
import type { ChatMessage } from "@/types";

export interface AgentOptions {
  provider: AIProvider;
  maxIterations?: number;
  onThought?: (thought: string) => void;
  onToolCall?: (toolCalls: Array<{ name: string; arguments: Record<string, unknown> }>) => void;
  onToolResult?: (results: string) => void;
}

/**
 * ReAct Agent 循环
 * Thought → Action → Observation → 迭代
 */
export async function runAgent(
  userMessage: string,
  history: ChatMessage[],
  options: AgentOptions,
  systemPrompt?: string
): Promise<string> {
  const maxIterations = options.maxIterations ?? 5;
  const messages: ChatMessage[] = [
    ...(systemPrompt
      ? [{ role: "system" as const, content: systemPrompt, id: "sys", timestamp: "" }]
      : []),
    ...history.filter((m) => m.role !== "system"),
    { role: "user" as const, content: userMessage, id: "um", timestamp: "" },
  ];

  // 构建 Agent system prompt
  const tools = toolRegistry.getAllDefinitions();
  const agentSystemPrompt = buildAgentSystemPrompt(tools);

  // 将 agent prompt 注入到 system 消息
  if (systemPrompt) {
    const sysIdx = messages.findIndex((m) => m.role === "system");
    if (sysIdx >= 0) {
      messages[sysIdx] = {
        ...messages[sysIdx],
        content: `${messages[sysIdx].content}\n\n${agentSystemPrompt}`,
      };
    }
  } else {
    messages.unshift({
      role: "system",
      content: agentSystemPrompt,
      id: "agent-sys",
      timestamp: "",
    });
  }

  let finalResponse = "";

  for (let i = 0; i < maxIterations; i++) {
    options.onThought?.(`--- 第 ${i + 1} 轮思考 ---`);

    // 调用 LLM
    const response = await callLLM(messages, options.provider);
    finalResponse = response;

    // 检查是否包含工具调用
    const toolCalls = parseToolCalls(response);

    if (toolCalls.length === 0) {
      // 没有工具调用，直接返回
      break;
    }

    options.onThought?.(`发现 ${toolCalls.length} 个工具调用`);
    options.onToolCall?.(
      toolCalls.map((tc) => ({ name: tc.name, arguments: tc.arguments }))
    );

    // 执行工具
    const results = await executeToolCalls(toolCalls);
    const resultText = summarizeToolResults(results);

    options.onToolResult?.(resultText);

    // 将工具结果加入对话历史
    messages.push({
      role: "assistant",
      content: response,
      id: `agent-res-${i}`,
      timestamp: new Date().toISOString(),
    });

    messages.push({
      role: "user",
      content: `工具执行结果：\n${resultText}\n\n请根据以上结果继续回答用户的问题。如果已经可以回答，请直接给出最终答案，不要再调用工具。`,
      id: `agent-tool-${i}`,
      timestamp: new Date().toISOString(),
    });
  }

  return finalResponse;
}

/**
 * 非流式调用 LLM
 */
async function callLLM(
  messages: ChatMessage[],
  provider: AIProvider
): Promise<string> {
  const url = `${provider.baseUrl.replace(/\/$/, "")}/v1/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (provider.apiKey) {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: provider.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM 请求失败: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? "";
}

/**
 * 构建 Agent 系统提示词
 */
function buildAgentSystemPrompt(
  tools: Array<{ name: string; description: string; parameters: Record<string, { type: string; description: string }> }>
): string {
  const toolList = tools
    .map(
      (t) =>
        `- **${t.name}**: ${t.description}\n  参数: ${Object.entries(t.parameters)
          .map(([k, v]) => `${k} (${v.type}) - ${v.description}`)
          .join(", ") || "无"}`
    )
    .join("\n");

  return `你是一个智能助手，可以使用以下工具来帮助用户完成任务。

可用工具：
${toolList}

## 工具调用规则

1. 当需要获取信息或执行操作时，使用 JSON 格式调用工具
2. 工具调用格式：
\`\`\`json
{"name": "工具名", "arguments": {"参数名": "参数值"}}
\`\`\`
3. 可以并行调用多个工具：
\`\`\`json
[{"name": "工具1", "arguments": {}}, {"name": "工具2", "arguments": {}}]
\`\`\`
4. 收到工具执行结果后，综合分析并给出最终答案
5. 如果已经获得足够信息，直接回答，不要再调用工具
6. 每次回复要么是工具调用，要么是最终答案，不要混合`;
}
