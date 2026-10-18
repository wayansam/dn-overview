import { Character } from "../interface/Account.interface";
import { formatGold, formatRange } from "./reward.util";
import {
  getAllRewardNames,
  getFloorRewards,
  pickRewardRows,
  summarizeWeeklyRewards,
} from "./weeklyReward.util";

const characters: Character[] = [
  { id: "c1", name: "Alice", level: 90, classId: "gladiator" },
  { id: "c2", name: "Bob", level: 80, classId: "sniper" },
];
const noTask = {
  characterClears: {},
  characterFloors: {},
  excludedCharacters: {},
  hiddenActivities: [],
};

describe("getFloorRewards", () => {
  test("Fission Maze gives the Erosion Reward Box of that floor", () => {
    expect(
      Object.fromEntries(getFloorRewards("fissionMaze", "Ascension 2F")),
    ).toEqual({
      Gold: { min: 189750000, max: 189750000 },
      "Erosion Fragment": { min: 32, max: 32 },
      "Concentrated Erosion Fragment": { min: 4, max: 12 },
    });
  });

  test("Ark of Transcendence gives the weekly clear of that floor", () => {
    expect(
      Object.fromEntries(getFloorRewards("arkOfTranscendence", "1")),
    ).toEqual({
      "Lunar Eclipse Fragment (6 types)": { min: 150, max: 150 },
      "Ancient Broken Dragon Jade Fragment": { min: 5, max: 5 },
      "Ark Stone Fragment": { min: 1, max: 1 },
    });
  });

  test("gives nothing for unknown floors or activities", () => {
    expect(getFloorRewards("fissionMaze", "Labyrinth 24F").size).toBe(0);
    expect(getFloorRewards("nightmare", "1").size).toBe(0);
  });
});

describe("summarizeWeeklyRewards", () => {
  test("adds up every character, cleared separately from total", () => {
    const summary = summarizeWeeklyRewards(characters, {
      ...noTask,
      characterFloors: {
        c1: { arkOfTranscendence: "1", fissionMaze: "Ascension 2F" },
        c2: { arkOfTranscendence: "2" },
      },
      characterClears: { c1: { arkOfTranscendence: "2026-10-18" } },
    });
    expect(summary.runCount).toBe(3);
    expect(summary.clearedCount).toBe(1);
    const lunar = summary.rows.find(
      (row) => row.name === "Lunar Eclipse Fragment (6 types)",
    );
    expect(lunar).toEqual({
      name: "Lunar Eclipse Fragment (6 types)",
      cleared: { min: 150, max: 150 },
      total: { min: 375, max: 375 },
    });
    const concentrated = summary.rows.find(
      (row) => row.name === "Concentrated Erosion Fragment",
    );
    expect(concentrated?.cleared).toEqual({ min: 0, max: 0 });
    expect(concentrated?.total).toEqual({ min: 4, max: 12 });
  });

  test("skips excluded characters, hidden activities and deleted characters", () => {
    const summary = summarizeWeeklyRewards(characters, {
      ...noTask,
      characterFloors: {
        c1: { arkOfTranscendence: "1", fissionMaze: "Ascension 2F" },
        c2: { arkOfTranscendence: "2" },
        gone: { arkOfTranscendence: "3" },
      },
      excludedCharacters: { arkOfTranscendence: ["c2"] },
      hiddenActivities: ["fissionMaze"],
    });
    expect(summary.runCount).toBe(1);
    expect(summary.rows.map((row) => row.name)).not.toContain("Gold");
    expect(
      summary.rows.find(
        (row) => row.name === "Lunar Eclipse Fragment (6 types)",
      )?.total,
    ).toEqual({ min: 150, max: 150 });
  });

  test("is empty without any floor picked", () => {
    expect(summarizeWeeklyRewards(characters, noTask)).toEqual({
      rows: [],
      runCount: 0,
      clearedCount: 0,
    });
  });
});

describe("pickRewardRows", () => {
  const earned = [
    {
      name: "Ark Stone Fragment",
      cleared: { min: 0, max: 0 },
      total: { min: 1, max: 1 },
    },
    { name: "Gold", cleared: { min: 5, max: 5 }, total: { min: 9, max: 9 } },
  ];
  const names = (rows: { name: string }[]) => rows.map((row) => row.name);

  test("lists every earned resource until customized, Fission Maze first", () => {
    expect(names(pickRewardRows(earned, undefined, false))).toEqual([
      "Gold",
      "Ark Stone Fragment",
    ]);
  });

  test("lists only the selected resources, at 0 when not earned", () => {
    const rows = pickRewardRows(earned, ["Gold", "Hero Coins"], false);
    expect(names(rows)).toEqual(["Gold", "Hero Coins"]);
    expect(rows[1].total).toEqual({ min: 0, max: 0 });
  });

  test("Show all adds the earned resources to the selected ones", () => {
    expect(names(pickRewardRows(earned, ["Hero Coins"], true))).toEqual([
      "Gold",
      "Ark Stone Fragment",
      "Hero Coins",
    ]);
  });

  test("knows every Fission Maze and Ark resource", () => {
    const all = getAllRewardNames();
    expect(all.slice(0, 3)).toEqual([
      "Gold",
      "Erosion Fragment",
      "Concentrated Erosion Fragment",
    ]);
    expect(all).toContain("Shiny Hero Coins");
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("reward.util", () => {
  // Thousands separators follow the browser locale.
  const n = (value: number) => value.toLocaleString();

  test("formats gold and ranges", () => {
    expect(formatGold(189750000)).toBe(`${n(18975)}g 00s 00c`);
    expect(formatGold(280527500)).toBe(`${n(28052)}g 75s 00c`);
    expect(formatRange(4, 12)).toBe("4 ~ 12");
    expect(formatRange(5, 5)).toBe("5");
    expect(formatRange(1500)).toBe(n(1500));
  });
});
