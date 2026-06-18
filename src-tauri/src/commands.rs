use serde::{Deserialize, Serialize};
use crate::database::Document;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateDocumentPayload {
    pub title: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateDocumentPayload {
    pub id: String,
    pub title: Option<String>,
    pub content: Option<String>,
    pub pinned: Option<bool>,
    pub starred: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SettingPayload {
    pub key: String,
    pub value: String,
}

#[tauri::command]
pub fn get_documents(db: tauri::State<crate::database::Database>) -> Result<Vec<Document>, String> {
    db.get_documents().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_document(id: String, db: tauri::State<crate::database::Database>) -> Result<Option<Document>, String> {
    db.get_document(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_document(
    payload: CreateDocumentPayload,
    db: tauri::State<crate::database::Database>,
) -> Result<Document, String> {
    let now = chrono::Utc::now().to_rfc3339();
    let id = uuid::Uuid::new_v4().to_string();
    let doc = Document {
        id: id.clone(),
        title: payload.title,
        content: payload.content,
        created_at: now.clone(),
        updated_at: now,
        pinned: false,
        starred: false,
    };
    db.create_document(&doc).map_err(|e| e.to_string())?;
    Ok(doc)
}

#[tauri::command]
pub fn update_document(
    payload: UpdateDocumentPayload,
    db: tauri::State<crate::database::Database>,
) -> Result<(), String> {
    let existing = db.get_document(&payload.id).map_err(|e| e.to_string())?;
    match existing {
        Some(mut doc) => {
            if let Some(title) = payload.title {
                doc.title = title;
            }
            if let Some(content) = payload.content {
                doc.content = content;
            }
            if let Some(pinned) = payload.pinned {
                doc.pinned = pinned;
            }
            if let Some(starred) = payload.starred {
                doc.starred = starred;
            }
            doc.updated_at = chrono::Utc::now().to_rfc3339();
            db.update_document(&doc).map_err(|e| e.to_string())
        }
        None => Err("Document not found".to_string()),
    }
}

#[tauri::command]
pub fn delete_document(id: String, db: tauri::State<crate::database::Database>) -> Result<(), String> {
    db.delete_document(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_setting(key: String, db: tauri::State<crate::database::Database>) -> Result<Option<String>, String> {
    db.get_setting(&key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_setting(payload: SettingPayload, db: tauri::State<crate::database::Database>) -> Result<(), String> {
    db.set_setting(&payload.key, &payload.value).map_err(|e| e.to_string())
}
