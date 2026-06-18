import { invoke } from "@tauri-apps/api/core";

export interface Snapshot {
  id: string;
  name: string;
  createdAt: string;
  documentCount: number;
  description?: string;
}

export interface BackupConfig {
  autoBackup: boolean;
  backupInterval: number; // 分钟
  maxSnapshots: number;
  backupPath?: string;
}

/**
 * Workspace 快照管理服务
 */
export class WorkspaceService {
  /**
   * 创建快照
   */
  async createSnapshot(name: string, description?: string): Promise<Snapshot> {
    return invoke<Snapshot>("plugin:workspace|create_snapshot", { name, description });
  }

  /**
   * 获取所有快照
   */
  async listSnapshots(): Promise<Snapshot[]> {
    return invoke<Snapshot[]>("plugin:workspace|list_snapshots");
  }

  /**
   * 恢复快照
   */
  async restoreSnapshot(snapshotId: string): Promise<void> {
    return invoke("plugin:workspace|restore_snapshot", { snapshotId });
  }

  /**
   * 删除快照
   */
  async deleteSnapshot(snapshotId: string): Promise<void> {
    return invoke("plugin:workspace|delete_snapshot", { snapshotId });
  }

  /**
   * 获取备份配置
   */
  async getBackupConfig(): Promise<BackupConfig> {
    return invoke<BackupConfig>("plugin:workspace|get_backup_config");
  }

  /**
   * 更新备份配置
   */
  async updateBackupConfig(config: Partial<BackupConfig>): Promise<void> {
    return invoke("plugin:workspace|update_backup_config", { config });
  }

  /**
   * 手动触发备份
   */
  async triggerBackup(): Promise<void> {
    return invoke("plugin:workspace|trigger_backup");
  }

  /**
   * 导出工作区为 JSON
   */
  async exportWorkspace(): Promise<string> {
    return invoke<string>("plugin:workspace|export_workspace");
  }

  /**
   * 从 JSON 导入工作区
   */
  async importWorkspace(jsonData: string): Promise<void> {
    return invoke("plugin:workspace|import_workspace", { jsonData });
  }
}

export const workspaceService = new WorkspaceService();
