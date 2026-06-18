/**
 * Tool Registry — JSON Schema 驱动的工具注册中心
 */

export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
  required?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  success: boolean;
  output: string;
  error?: string;
}

export type ToolHandler = (
  args: Record<string, unknown>
) => Promise<string>;

interface RegisteredTool {
  definition: ToolDefinition;
  handler: ToolHandler;
}

export class ToolRegistry {
  private tools: Map<string, RegisteredTool> = new Map();

  /**
   * 注册工具
   */
  register(definition: ToolDefinition, handler: ToolHandler): void {
    this.tools.set(definition.name, { definition, handler });
  }

  /**
   * 注销工具
   */
  unregister(name: string): void {
    this.tools.delete(name);
  }

  /**
   * 获取工具定义（用于发送给 LLM）
   */
  getDefinition(name: string): ToolDefinition | undefined {
    return this.tools.get(name)?.definition;
  }

  /**
   * 获取所有工具定义（用于 system prompt）
   */
  getAllDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  /**
   * 获取所有工具定义的 OpenAI function calling 格式
   */
  getOpenAIFunctions(): Array<{
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: {
        type: "object";
        properties: Record<string, { type: string; description: string; enum?: string[] }>;
        required: string[];
      };
    };
  }> {
    return Array.from(this.tools.values()).map((t) => ({
      type: "function" as const,
      function: {
        name: t.definition.name,
        description: t.definition.description,
        parameters: {
          type: "object" as const,
          properties: Object.fromEntries(
            Object.entries(t.definition.parameters).map(([key, param]) => [
              key,
              {
                type: param.type,
                description: param.description,
                ...(param.enum ? { enum: param.enum } : {}),
              },
            ])
          ),
          required: Object.entries(t.definition.parameters)
            .filter(([, param]) => param.required)
            .map(([key]) => key),
        },
      },
    }));
  }

  /**
   * 执行工具
   */
  async execute(toolCall: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(toolCall.name);
    if (!tool) {
      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: false,
        output: "",
        error: `工具 "${toolCall.name}" 未注册`,
      };
    }

    try {
      const output = await tool.handler(toolCall.arguments);
      return {
        toolCallId: toolCall.id,
        name: toolCall.name,
        success: true,
        output,
      };
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
   * 批量并行执行工具
   */
  async executeAll(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    return Promise.all(toolCalls.map((tc) => this.execute(tc)));
  }

  /**
   * 获取已注册工具数量
   */
  get size(): number {
    return this.tools.size;
  }

  /**
   * 检查工具是否存在
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }
}

// 全局单例
export const toolRegistry = new ToolRegistry();
