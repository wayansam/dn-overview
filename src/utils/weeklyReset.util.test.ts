import {
  clearBeforeReset,
  formatCountdown,
  getLastReset,
  getNextReset,
  getServerTimestamp,
  parseClearTime,
  resetWeek,
} from "./weeklyReset.util";
import { TaskStore } from "../interface/Task.interface";

const at = (iso: string) => new Date(iso);
const iso = (time: number) => new Date(time).toISOString();

describe("getLastReset", () => {
  test("is the latest Saturday 09:00 server time (01:00 UTC)", () => {
    // Wednesday 7 Oct -> Saturday 3 Oct.
    expect(iso(getLastReset(at("2026-10-07T12:00:00+08:00")))).toBe(
      "2026-10-03T01:00:00.000Z",
    );
  });

  test("Saturday before 09:00 still belongs to the previous week", () => {
    expect(iso(getLastReset(at("2026-10-03T08:59:59+08:00")))).toBe(
      "2026-09-26T01:00:00.000Z",
    );
    expect(iso(getLastReset(at("2026-10-03T09:00:00+08:00")))).toBe(
      "2026-10-03T01:00:00.000Z",
    );
  });

  test("uses server time, not the user's own day", () => {
    // Friday 23:30 in UTC is already Saturday 07:30 in Singapore: no reset
    // yet. Friday 01:30 UTC is Saturday 09:30 there: reset passed.
    expect(iso(getLastReset(at("2026-10-02T23:30:00Z")))).toBe(
      "2026-09-26T01:00:00.000Z",
    );
    expect(iso(getLastReset(at("2026-10-03T01:30:00Z")))).toBe(
      "2026-10-03T01:00:00.000Z",
    );
  });

  test("next reset is a week after the last one", () => {
    expect(iso(getNextReset(at("2026-10-07T12:00:00+08:00")))).toBe(
      "2026-10-10T01:00:00.000Z",
    );
  });
});

describe("timestamps", () => {
  test("records server time with its offset", () => {
    expect(getServerTimestamp(at("2026-10-18T23:30:05Z"))).toBe(
      "2026-10-19T07:30:05+08:00",
    );
  });

  test("older date-only clears count as the start of that server day", () => {
    expect(parseClearTime("2026-10-03")).toBe(
      Date.parse("2026-10-03T00:00:00+08:00"),
    );
    expect(parseClearTime("2026-10-03T10:00:00+08:00")).toBe(
      Date.parse("2026-10-03T02:00:00Z"),
    );
  });
});

test("formats the countdown", () => {
  const MIN = 60000;
  expect(formatCountdown((2 * 24 * 60 + 19 * 60 + 55) * MIN)).toBe(
    "2d 19h 55m",
  );
  expect(formatCountdown((24 * 60 + 5) * MIN)).toBe("1d 0h 5m");
  expect(formatCountdown(55 * MIN)).toBe("55m");
  expect(formatCountdown(30 * 1000)).toBe("1m");
});

test("clears only what was done before the reset", () => {
  const reset = Date.parse("2026-10-03T09:00:00+08:00");
  const task = {
    entries: [
      {
        id: "a",
        category: "weeklyAccount" as const,
        taskId: "x",
        lastCleared: "2026-10-03T08:59:00+08:00",
      },
      {
        id: "b",
        category: "weeklyAccount" as const,
        taskId: "x",
        lastCleared: "2026-10-03T09:01:00+08:00",
      },
      // Date only on reset day: counts as 00:00, so before the reset.
      {
        id: "c",
        category: "weeklyAccount" as const,
        taskId: "x",
        lastCleared: "2026-10-03",
      },
    ],
    characterClears: {
      c1: { fissionMaze: "2026-10-02", nightmare: "2026-10-04" },
      c2: { fissionMaze: "2026-10-01T12:00:00+08:00" },
    },
  };
  expect(clearBeforeReset(task, reset)).toBe(true);
  expect(task.entries.map((item) => item.lastCleared)).toEqual([
    undefined,
    "2026-10-03T09:01:00+08:00",
    undefined,
  ]);
  expect(task.characterClears).toEqual({ c1: { nightmare: "2026-10-04" } });
  expect(clearBeforeReset(task, reset)).toBe(false);
});

describe("resetWeek", () => {
  const reset = Date.parse("2026-10-03T09:00:00+08:00");
  const makeTask = (): TaskStore => ({
    version: 1,
    entries: [
      {
        id: "a",
        category: "weeklyAccount",
        taskId: "goldDragonNest",
        characterId: "c1",
        lastCleared: "2026-10-01T20:00:00+08:00",
      },
      // Two weeks ago: cleared, but not part of last week.
      {
        id: "b",
        category: "weeklyAccount",
        taskId: "chaosDuelNest",
        lastCleared: "2026-09-25T20:00:00+08:00",
      },
      { id: "c", category: "weeklyAccount", taskId: "frozenDragonNest" },
    ],
    characterClears: {
      c1: { fissionMaze: "2026-10-02T10:00:00+08:00" },
      c2: { nightmare: "2026-09-20" },
    },
    characterFloors: {
      c1: { fissionMaze: "Ascension 2F" },
      c2: { arkOfTranscendence: "5" },
    },
    excludedCharacters: {},
    hiddenActivities: [],
  });

  test("saves the week that ended, then clears it", () => {
    const task = makeTask();
    resetWeek(task, reset);
    expect(task.lastWeek).toEqual({
      weekStart: "2026-09-26T09:00:00+08:00",
      weekEnd: "2026-10-03T09:00:00+08:00",
      accountClears: [
        {
          taskId: "goldDragonNest",
          groupId: undefined,
          characterId: "c1",
          clearedAt: "2026-10-01T20:00:00+08:00",
        },
      ],
      characterClears: { c1: { fissionMaze: "2026-10-02T10:00:00+08:00" } },
      characterFloors: { c1: { fissionMaze: "Ascension 2F" } },
    });
    expect(task.entries.every((item) => !item.lastCleared)).toBe(true);
    expect(task.characterClears).toEqual({});
  });

  test("keeps the saved week on later checks of the same reset", () => {
    const task = makeTask();
    resetWeek(task, reset);
    const saved = task.lastWeek;
    task.entries[2].lastCleared = "2026-10-03T10:00:00+08:00";
    resetWeek(task, reset);
    expect(task.lastWeek).toBe(saved);
    expect(task.entries[2].lastCleared).toBe("2026-10-03T10:00:00+08:00");
  });

  test("a week with nothing cleared is saved empty", () => {
    const task = makeTask();
    resetWeek(task, reset + 7 * 24 * 60 * 60 * 1000);
    expect(task.lastWeek).toMatchObject({
      weekStart: "2026-10-03T09:00:00+08:00",
      accountClears: [],
      characterClears: {},
    });
  });
});
