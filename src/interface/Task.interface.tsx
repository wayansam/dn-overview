// Task tables in the Task tab. Only "weeklyAccount" exists for now.
export type TaskCategory = "weeklyAccount";

// Static reference data (src/data/task/TaskData.tsx).
export interface TaskInfo {
  id: string;
  name: string;
  category: TaskCategory;
}

// User data, persisted to localStorage (src/utils/taskStorage.util.tsx).
export interface TaskEntry {
  id: string;
  category: TaskCategory;
  taskId: string;
  groupId?: string;
  characterId?: string;
  // Local date as YYYY-MM-DD, missing until marked done.
  lastCleared?: string;
}

export interface TaskStore {
  version: number;
  entries: TaskEntry[];
}
