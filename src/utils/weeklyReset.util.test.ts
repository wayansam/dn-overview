import {
  clearBeforeReset,
  formatCountdown,
  getLastReset,
  getNextReset,
  getServerTimestamp,
  parseClearTime,
} from "./weeklyReset.util";

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
