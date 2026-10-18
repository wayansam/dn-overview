import { LS_KEYS } from "../constants/localStorage.constants";
import {
  SERVER_TIME_ZONE,
  TASK_STORE_VERSION,
} from "../constants/Task.constants";
import { getTaskById } from "../data/task/TaskData";
import { DateMap, TaskEntry, TaskStore } from "../interface/Task.interface";
import { getAllRewardNames } from "./weeklyReward.util";

export const emptyTaskStore = (): TaskStore => ({
  version: TASK_STORE_VERSION,
  entries: [],
  characterClears: {},
  characterFloors: {},
  excludedCharacters: {},
  hiddenActivities: [],
});

// en-CA formats dates as YYYY-MM-DD.
const serverDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: SERVER_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Today on the game server (Singapore time), as YYYY-MM-DD, whatever the
// user's own time zone.
export const getToday = (now = new Date()) => serverDateFormatter.format(now);

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

// characterId -> activityId -> value, keeping only known activities and
// values that pass `isValid`.
const toCharacterMap = (
  value: unknown,
  isValid: (activityId: string, value: string) => boolean,
): DateMap => {
  if (!isObject(value)) return {};
  const result: DateMap = {};
  Object.entries(value).forEach(([characterId, byActivity]) => {
    if (!isObject(byActivity)) return;
    const valid = Object.entries(byActivity).filter(
      (pair): pair is [string, string] =>
        isWeeklyCharacterTask(pair[0]) &&
        typeof pair[1] === "string" &&
        isValid(pair[0], pair[1]),
    );
    if (valid.length) result[characterId] = Object.fromEntries(valid);
  });
  return result;
};

const isDate = (_: string, value: string) => DATE_PATTERN.test(value);
// Floors removed from the Stage data are dropped.
const isKnownFloor = (activityId: string, value: string) =>
  !!getTaskById(activityId)?.floors?.some((item) => item.value === value);

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
    const {
      entries,
      characterClears,
      characterFloors,
      excludedCharacters,
      hiddenActivities,
      shownRewards,
    } = parsed as Record<string, unknown>;
    return {
      version: TASK_STORE_VERSION,
      entries: (Array.isArray(entries) ? entries : [])
        .map(toEntry)
        .filter((item): item is TaskEntry => !!item),
      characterClears: toCharacterMap(characterClears, isDate),
      characterFloors: toCharacterMap(characterFloors, isKnownFloor),
      excludedCharacters: toExcludedCharacters(excludedCharacters),
      hiddenActivities: (Array.isArray(hiddenActivities)
        ? hiddenActivities
        : []
      ).filter(
        (id): id is string =>
          typeof id === "string" && isWeeklyCharacterTask(id),
      ),
      // Resources no longer in the Stage data are dropped.
      shownRewards: Array.isArray(shownRewards)
        ? getAllRewardNames().filter((name) => shownRewards.includes(name))
        : undefined,
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
