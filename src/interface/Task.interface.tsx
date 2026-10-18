// Task tables in the Task tab.
export type TaskCategory = "weeklyAccount" | "weeklyCharacter";

// Static reference data (src/data/task/TaskData.tsx).
export interface TaskInfo {
  id: string;
  name: string;
  category: TaskCategory;
  // Floors to pick from (Weekly Character), values are persisted.
  floors?: { label: string; value: string }[];
}

// User data, persisted to localStorage (src/utils/taskStorage.util.tsx).
export interface TaskEntry {
  id: string;
  category: TaskCategory;
  taskId: string;
  groupId?: string;
  characterId?: string;
  // Server time it was marked done ("2026-10-18T14:05:09+08:00"; older saves
  // hold a date only), missing until done or after the weekly reset.
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
  // Weekly Character: floor each character runs, characterId -> activityId.
  characterFloors: Record<string, Record<string, string>>;
  // Weekly Character: activityId -> characters that skip it.
  excludedCharacters: Record<string, string[]>;
  // Weekly Character: activities left out of the table.
  hiddenActivities: string[];
  // Weekly Rewards: resources always listed. Missing until customized, which
  // lists every resource being earned.
  shownRewards?: string[];
}
