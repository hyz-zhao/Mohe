# 软件设计说明书（SDD）

项目名称：墨核 Mohe
版本：v0.4.0
日期：2026-06-18

---

# 1. 引言

## 1.1 目的

本文档描述墨核系统的软件架构设计、模块划分、接口定义与数据结构，为后续维护与扩展提供依据。

## 1.2 范围

系统为桌面端 AI Markdown 知识管理应用，运行于 Windows 平台。


---

# 2. 系统概述

## 2.1 系统目标

- 提供高质量 Markdown 编辑体验
- 集成 AI 对话与工具调用
- 支持本地知识库 RAG 检索
- 提供长期记忆能力


## 2.2 运行环境

- Windows 10 / 11
- Node.js 开发环境
- Rust toolchain


---

# 3. 系统架构设计

## 3.1 总体架构图（逻辑）

UI 层 → 状态层 → 服务层 → 数据层 → Tauri 后端


## 3.2 模块划分

### 3.2.1 UI 模块

- Editor
- Chat Panel
- Sidebar
- Settings


### 3.2.2 状态管理模块

- editorStore
- chatStore
- appStore
- settingsStore
- historyStore
- toastStore


### 3.2.3 AI 服务模块

接口：

- sendMessage()
- streamChat()
- parseToolCall()

支持双通道：

- 外部 API（OpenAI 兼容）
- 本地 Ollama（零费用，隐私优先）


### 3.2.4 RAG 模块

接口：

- indexDocument()
- embedText()
- searchSimilar()

分块策略：标题层级 + 固定长度混合分块

向量存储：sqlite-vss 扩展，余弦相似度检索


### 3.2.5 Agent 模块

接口：

- detectIntent()
- selectTools()
- executeTools()

设计：

- JSON Schema 驱动的 Tool Registry
- ReAct 循环支持复杂任务
- 工具执行超时 + 熔断保护


### 3.2.6 数据库模块

接口：

- initDatabase()
- saveDocument()
- getDocuments()
- saveMemory()
- getMemories()


---

# 4. 数据设计

## 4.1 数据库表

### documents

- id
- title
- content
- created_at
- updated_at

### rag_chunks

- id
- document_id
- content
- embedding（向量）

### memories

- id
- content
- category（陈述性 / 程序性）
- locked
- decay（衰减系数）

### chats

- id
- messages
- created_at


---

# 5. 接口设计

## 5.1 前后端接口（Tauri Commands）

- read_file
- write_file
- encrypt_key
- decrypt_key


## 5.2 AI Provider 接口

统一 OpenAI 兼容格式：

POST /v1/chat/completions

支持流式：

stream: true


---

# 6. 异常处理设计

- 网络异常重试
- 流式中断处理
- 文件访问异常提示
- 数据库初始化失败处理


---

# 7. 安全设计

- API Key 使用 Windows DPAPI 加密
- 支持用户自定义密码加密（PBKDF2）
- 路径校验避免越权访问
- CSP 限制资源加载


---

# 8. 性能设计

- 编辑器按需渲染 + 大文档虚拟滚动
- 向量检索 Top-K
- 工具调用并行执行
- Zustand debounce 增量持久化


---

# 9. 可扩展性设计

- Provider 抽象接口
- Tool Registry 可扩展
- RAG 管线模块化


---

# 10. 维护说明

- 前端与 Rust 后端解耦
- 所有 AI 逻辑集中在 services 目录
- 数据访问集中在 database 层


---

# 11. 结论

本系统采用模块化架构与本地优先策略，兼顾安全性、性能与扩展性，适用于长期演进与功能增强。