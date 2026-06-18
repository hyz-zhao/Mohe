import { create } from "zustand";
import { workspaceService, type Snapshot, type BackupConfig } from "@/services/workspace";

interface WorkspaceState {
  snapshots: Snapshot[];
  backupConfig: BackupConfig;
  isLoading: boolean;
  lastBackupTime?: string;

  loadSnapshots: () => Promise<void>;
  createSnapshot: (name: string, description?: string) => Promise<void>;
  restoreSnapshot: (snapshotId: string) => Promise<void>;
  deleteSnapshot: (snapshotId: string) => Promise<void>;
  loadBackupConfig: () => Promise<void>;
  updateBackupConfig: (config: Partial<BackupConfig>) => Promise<void>;
  triggerBackup: () => Promise<void>;
  exportWorkspace: () => Promise<string>;
  importWorkspace: (jsonData: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  snapshots: [],
  backupConfig: {
    autoBackup: false,
    backupInterval: 60,
    maxSnapshots: 10,
  },
  isLoading: false,

  loadSnapshots: async () => {
    set({ isLoading: true });
    try {
      const snapshots = await workspaceService.listSnapshots();
      set({ snapshots, isLoading: false });
    } catch (error) {
      console.error("加载快照失败:", error);
      set({ isLoading: false });
    }
  },

  createSnapshot: async (name, description) => {
    try {
      await workspaceService.createSnapshot(name, description);
      await get().loadSnapshots();
    } catch (error) {
      console.error("创建快照失败:", error);
      throw error;
    }
  },

  restoreSnapshot: async (snapshotId) => {
    try {
      await workspaceService.restoreSnapshot(snapshotId);
      // 恢复后需要重新加载应用状态
      window.location.reload();
    } catch (error) {
      console.error("恢复快照失败:", error);
      throw error;
    }
  },

  deleteSnapshot: async (snapshotId) => {
    try {
      await workspaceService.deleteSnapshot(snapshotId);
      await get().loadSnapshots();
    } catch (error) {
      console.error("删除快照失败:", error);
      throw error;
    }
  },

  loadBackupConfig: async () => {
    try {
      const backupConfig = await workspaceService.getBackupConfig();
      set({ backupConfig });
    } catch (error) {
      console.error("加载备份配置失败:", error);
    }
  },

  updateBackupConfig: async (config) => {
    try {
      await workspaceService.updateBackupConfig(config);
      await get().loadBackupConfig();
    } catch (error) {
      console.error("更新备份配置失败:", error);
      throw error;
    }
  },

  triggerBackup: async () => {
    try {
      await workspaceService.triggerBackup();
      set({ lastBackupTime: new Date().toISOString() });
      await get().loadSnapshots();
    } catch (error) {
      console.error("触发备份失败:", error);
      throw error;
    }
  },

  exportWorkspace: async () => {
    try {
      return await workspaceService.exportWorkspace();
    } catch (error) {
      console.error("导出工作区失败:", error);
      throw error;
    }
  },

  importWorkspace: async (jsonData) => {
    try {
      await workspaceService.importWorkspace(jsonData);
      window.location.reload();
    } catch (error) {
      console.error("导入工作区失败:", error);
      throw error;
    }
  },
}));
