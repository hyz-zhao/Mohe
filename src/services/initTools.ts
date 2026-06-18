import { registerBuiltinTools } from "@/services/builtinTools";
import type { RAGOptions } from "@/services/rag";
import { useSettingsStore } from "@/stores/settingsStore";
import type { AIProvider } from "@/services/ai";

let initialized = false;

/**
 * 初始化所有内置工具（仅执行一次）
 */
export function initTools() {
  if (initialized) return;
  initialized = true;

  registerBuiltinTools(() => {
    const settings = useSettingsStore.getState();
    const provider: AIProvider = {
      name: settings.apiProvider,
      baseUrl: settings.baseUrl,
      apiKey: settings.apiKey,
      model: settings.model,
    };

    const ragOptions: RAGOptions = {
      provider,
      embeddingModel: settings.embeddingModel,
      topK: 5,
      minScore: 0.3,
    };

    return ragOptions;
  });

  console.log(`[Mohe] 已注册 ${5} 个内置工具`);
}
