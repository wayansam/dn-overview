import {
  SERVER_UTC_OFFSET_HOURS,
  WEEKLY_RESET_DAY,
  WEEKLY_RESET_HOUR,
} from "../constants/Task.constants";
import { TaskStore, WeeklyHistory } from "../interface/Task.interface";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const OFFSET = SERVER_UTC_OFFSET_HOURS * HOUR;
const OFFSET_TEXT = `+${String(SERVER_UTC_OFFSET_HOURS).padStart(2, "0")}:00`;

// Server time can be read off a Date shifted by the offset, using its UTC
// getters (the server has no daylight saving).
const toServerClock = (time: number) => new Date(time + OFFSET);

// Now on the server, e.g. "2026-10-18T14:05:09+08:00". Starts with the
// server date, so it sorts and slices like a YYYY-MM-DD date.
export const getServerTimestamp = (now = new Date()) =>
  toServerClock(now.getTime()).toISOString().slice(0, 19) + OFFSET_TEXT;

// Clear times saved before timestamps were used are dates only; they count
// as the start of that server day.
export const parseClearTime = (value: string) =>
  Date.parse(value.length === 10 ? `${value}T00:00:00${OFFSET_TEXT}` : value);

// Most recent weekly reset (Saturday 09:00 server time) at or before `now`.
export const getLastReset = (now = new Date()) => {
  const clock = toServerClock(now.getTime());
  const daysSince = (clock.getUTCDay() - WEEKLY_RESET_DAY + 7) % 7;
  let reset =
    Date.UTC(
      clock.getUTCFullYear(),
      clock.getUTCMonth(),
      clock.getUTCDate() - daysSince,
      WEEKLY_RESET_HOUR,
    ) - OFFSET;
  if (reset > now.getTime()) reset -= WEEK;
  return reset;
};

export const getNextReset = (now = new Date()) => getLastReset(now) + WEEK;

// "2d 19h 55m", or "55m" when less than an hour is left.
export const formatCountdown = (ms: number) => {
  const minutes = Math.max(0, Math.ceil(ms / 60000));
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  return [d && `${d}d`, (d || h) && `${h}h`, `${m}m`].filter(Boolean).join(" ");
};

type ClearData = Pick<TaskStore, "entries" | "characterClears">;

// What was cleared in the week ending at `lastReset`. Copies plain values,
// so it is safe to call on Immer drafts.
const snapshotWeek = (
  task: Pick<TaskStore, "entries" | "characterClears" | "characterFloors">,
  lastReset: number,
): WeeklyHistory => {
  const weekStart = lastReset - WEEK;
  const inWeek = (value: string) => {
    const time = parseClearTime(value);
    return time >= weekStart && time < lastReset;
  };
  const characterClears: WeeklyHistory["characterClears"] = {};
  Object.entries(task.characterClears).forEach(([characterId, clears]) => {
    const kept = Object.entries(clears).filter(([, value]) => inWeek(value));
    if (kept.length) characterClears[characterId] = Object.fromEntries(kept);
  });
  return {
    weekStart: getServerTimestamp(new Date(weekStart)),
    weekEnd: getServerTimestamp(new Date(lastReset)),
    accountClears: task.entries
      .filter((entry) => entry.lastCleared && inWeek(entry.lastCleared))
      .map(({ taskId, groupId, characterId, lastCleared }) => ({
        taskId,
        groupId,
        characterId,
        clearedAt: lastCleared!,
      })),
    characterClears,
    characterFloors: Object.fromEntries(
      Object.keys(characterClears).map((characterId) => [
        characterId,
        { ...task.characterFloors[characterId] },
      ]),
    ),
  };
};

// Runs the weekly reset as of `lastReset`: the first time a reset is seen,
// the week it ended is saved as `lastWeek`, then older clears are dropped.
// Mutates (works on Immer drafts).
export const resetWeek = (task: TaskStore, lastReset: number) => {
  const weekEnd = getServerTimestamp(new Date(lastReset));
  if (task.lastWeek?.weekEnd !== weekEnd) {
    task.lastWeek = snapshotWeek(task, lastReset);
  }
  clearBeforeReset(task, lastReset);
};

// Drops clears from before `lastReset` (mutates; works on Immer drafts).
// Returns whether anything changed.
export const clearBeforeReset = (task: ClearData, lastReset: number) => {
  let changed = false;
  const isOld = (value: string) => parseClearTime(value) < lastReset;
  task.entries.forEach((entry) => {
    if (entry.lastCleared && isOld(entry.lastCleared)) {
      entry.lastCleared = undefined;
      changed = true;
    }
  });
  Object.entries(task.characterClears).forEach(([characterId, clears]) => {
    Object.entries(clears).forEach(([activityId, value]) => {
      if (isOld(value)) {
        delete clears[activityId];
        changed = true;
      }
    });
    if (!Object.keys(clears).length) delete task.characterClears[characterId];
  });
  return changed;
};
