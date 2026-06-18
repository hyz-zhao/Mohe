import { invoke } from "@tauri-apps/api/core";
import type { Document } from "@/types";

// Document APIs
export async function getDocuments(): Promise<Document[]> {
  return invoke<Document[]>("get_documents");
}

export async function getDocument(id: string): Promise<Document | null> {
  return invoke<Document | null>("get_document", { id });
}

export async function createDocument(
  title: string,
  content: string
): Promise<Document> {
  return invoke<Document>("create_document", {
    payload: { title, content },
  });
}

export async function updateDocument(
  id: string,
  updates: {
    title?: string;
    content?: string;
    pinned?: boolean;
    starred?: boolean;
  }
): Promise<void> {
  return invoke<void>("update_document", {
    payload: { id, ...updates },
  });
}

export async function deleteDocument(id: string): Promise<void> {
  return invoke<void>("delete_document", { id });
}

// Settings APIs
export async function getSetting(key: string): Promise<string | null> {
  return invoke<string | null>("get_setting", { key });
}

export async function setSetting(key: string, value: string): Promise<void> {
  return invoke<void>("set_setting", { payload: { key, value } });
}
