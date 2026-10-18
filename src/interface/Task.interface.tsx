// Task tables in the Task tab.
export type TaskCategory = "weeklyAccount" | "weeklyCharacter";

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

// Dates (YYYY-MM-DD) keyed by id, e.g. characterId -> activityId -> date.
export type DateMap = Record<string, Record<string, string>>;

export interface TaskStore {
  version: number;
  // Weekly Account rows.
  entries: TaskEntry[];
  // Weekly Character: when each character last cleared each activity.
  characterClears: DateMap;
  // Weekly Character: activityId -> characters that skip it.
  excludedCharacters: Record<string, string[]>;
  // Weekly Character: activities left out of the table.
  hiddenActivities: string[];
}
