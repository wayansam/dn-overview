import { LS_KEYS } from "../constants/localStorage.constants";
import { TASK_STORE_VERSION } from "../constants/Task.constants";
import { getTaskById } from "../data/task/TaskData";
import { DateMap, TaskEntry, TaskStore } from "../interface/Task.interface";

export const emptyTaskStore = (): TaskStore => ({
  version: TASK_STORE_VERSION,
  entries: [],
  characterClears: {},
  excludedCharacters: {},
  hiddenActivities: [],
});

// Today in the user's timezone, as YYYY-MM-DD.
export const getToday = (now = new Date()) =>
  [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// "2026-10-18" -> "18 Oct 2026".
export const formatDate = (value?: string) => {
  if (!value || !DATE_PATTERN.test(value)) return "-";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toEntry = (value: unknown): TaskEntry | null => {
  if (typeof value !== "object" || value === null) return null;
  const { id, category, taskId, groupId, characterId, lastCleared } =
    value as Record<string, unknown>;
  if (typeof id !== "string" || typeof taskId !== "string") return null;
  // Tasks removed from TaskData are dropped.
  const task = getTaskById(taskId);
  if (!task || task.category !== category) return null;
  return {
    id,
    category: task.category,
    taskId,
    groupId: typeof groupId === "string" ? groupId : undefined,
    characterId: typeof characterId === "string" ? characterId : undefined,
    lastCleared:
      typeof lastCleared === "string" && DATE_PATTERN.test(lastCleared)
        ? lastCleared
        : undefined,
  };
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isWeeklyCharacterTask = (id: string) =>
  getTaskById(id)?.category === "weeklyCharacter";

// characterId -> activityId -> date, keeping only known activities and
// valid dates.
const toCharacterClears = (value: unknown): DateMap => {
  if (!isObject(value)) return {};
  const result: DateMap = {};
  Object.entries(value).forEach(([characterId, clears]) => {
    if (!isObject(clears)) return;
    const valid = Object.entries(clears).filter(
      (pair): pair is [string, string] =>
        isWeeklyCharacterTask(pair[0]) &&
        typeof pair[1] === "string" &&
        DATE_PATTERN.test(pair[1]),
    );
    if (valid.length) result[characterId] = Object.fromEntries(valid);
  });
  return result;
};

const toExcludedCharacters = (value: unknown): Record<string, string[]> => {
  if (!isObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([activityId, ids]) =>
          isWeeklyCharacterTask(activityId) && Array.isArray(ids),
      )
      .map(([activityId, ids]) => [
        activityId,
        (ids as unknown[]).filter((id): id is string => typeof id === "string"),
      ]),
  );
};

// Never throws: corrupted or hand-edited storage falls back to what can be
// salvaged.
export const loadTaskStore = (): TaskStore => {
  try {
    const raw = localStorage.getItem(LS_KEYS.tasks);
    if (!raw) return emptyTaskStore();
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return emptyTaskStore();
    const { entries, characterClears, excludedCharacters, hiddenActivities } =
      parsed as Record<string, unknown>;
    return {
      version: TASK_STORE_VERSION,
      entries: (Array.isArray(entries) ? entries : [])
        .map(toEntry)
        .filter((item): item is TaskEntry => !!item),
      characterClears: toCharacterClears(characterClears),
      excludedCharacters: toExcludedCharacters(excludedCharacters),
      hiddenActivities: (Array.isArray(hiddenActivities)
        ? hiddenActivities
        : []
      ).filter(
        (id): id is string =>
          typeof id === "string" && isWeeklyCharacterTask(id),
      ),
    };
  } catch {
    return emptyTaskStore();
  }
};

export const saveTaskStore = (store: TaskStore) => {
  try {
    localStorage.setItem(LS_KEYS.tasks, JSON.stringify(store));
  } catch {
    // Storage full or blocked (private mode): keep working in memory.
  }
};
