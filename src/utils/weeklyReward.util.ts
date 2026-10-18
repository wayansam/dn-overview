import { AOT_WEEKLY, FISSION_MAZE_WEEKLY } from "../data/task/TaskData";
import { Character } from "../interface/Account.interface";
import { TaskStore } from "../interface/Task.interface";

// Item name for Fission Maze gold, which is stored in copper.
export const GOLD = "Gold";

export interface RewardAmount {
  min: number;
  max: number;
}

export interface WeeklyRewardRow {
  name: string;
  // From the activities already ticked.
  cleared: RewardAmount;
  // If every counted activity is cleared.
  total: RewardAmount;
}

export interface WeeklyRewardSummary {
  rows: WeeklyRewardRow[];
  // Character + activity pairs with a floor picked, and how many are ticked.
  runCount: number;
  clearedCount: number;
}

type RewardMap = Map<string, RewardAmount>;

// Rewards of one weekly clear at `floor`. Activities without reward data
// (e.g. Nightmare) give nothing.
export const getFloorRewards = (
  activityId: string,
  floor: string,
): RewardMap => {
  const rewards: RewardMap = new Map();
  if (activityId === "fissionMaze") {
    const data = FISSION_MAZE_WEEKLY.data.find((item) => item.floor === floor);
    if (!data) return rewards;
    rewards.set(GOLD, { min: data.gold, max: data.gold });
    rewards.set("Erosion Fragment", {
      min: data.erosionFragment,
      max: data.erosionFragment,
    });
    if (data.concentratedErosionFragment) {
      rewards.set("Concentrated Erosion Fragment", {
        ...data.concentratedErosionFragment,
      });
    }
  } else if (activityId === "arkOfTranscendence") {
    const data = AOT_WEEKLY.data.find((item) => String(item.floor) === floor);
    Object.entries(data?.rewards ?? {}).forEach(([name, amount]) => {
      if (typeof amount === "number" && amount > 0) {
        rewards.set(name, { min: amount, max: amount });
      }
    });
  }
  return rewards;
};

// Every resource Fission Maze and Ark of Transcendence can give, Fission
// Maze first. The summary and the Customize list use this order.
export const getAllRewardNames = () => {
  const names = new Set<string>();
  FISSION_MAZE_WEEKLY.data.forEach(({ floor }) =>
    getFloorRewards("fissionMaze", floor).forEach((_, name) => names.add(name)),
  );
  AOT_WEEKLY.data.forEach(({ floor }) =>
    getFloorRewards("arkOfTranscendence", String(floor)).forEach((_, name) =>
      names.add(name),
    ),
  );
  return Array.from(names);
};

const addInto = (target: RewardMap, rewards: RewardMap) =>
  rewards.forEach((amount, name) => {
    const current = target.get(name) ?? { min: 0, max: 0 };
    target.set(name, {
      min: current.min + amount.min,
      max: current.max + amount.max,
    });
  });

// Adds up the weekly rewards of every character, at the floor picked for
// each activity. Excluded characters and hidden activities are left out.
export const summarizeWeeklyRewards = (
  characters: Character[],
  task: Pick<
    TaskStore,
    | "characterClears"
    | "characterFloors"
    | "excludedCharacters"
    | "hiddenActivities"
  >,
): WeeklyRewardSummary => {
  const cleared: RewardMap = new Map();
  const total: RewardMap = new Map();
  let runCount = 0;
  let clearedCount = 0;

  characters.forEach(({ id }) => {
    Object.entries(task.characterFloors[id] ?? {}).forEach(
      ([activityId, floor]) => {
        if (task.hiddenActivities.includes(activityId)) return;
        if (task.excludedCharacters[activityId]?.includes(id)) return;
        const rewards = getFloorRewards(activityId, floor);
        if (!rewards.size) return;
        runCount++;
        addInto(total, rewards);
        if (task.characterClears[id]?.[activityId]) {
          clearedCount++;
          addInto(cleared, rewards);
        }
      },
    );
  });

  return {
    rows: Array.from(total, ([name, amount]) => ({
      name,
      cleared: cleared.get(name) ?? { min: 0, max: 0 },
      total: amount,
    })),
    runCount,
    clearedCount,
  };
};

const NONE: RewardAmount = { min: 0, max: 0 };

// Rows the summary table lists. `shownRewards` are always listed (0 when not
// earned); without it, or with `showAll`, every earned resource is too.
export const pickRewardRows = (
  rows: WeeklyRewardRow[],
  shownRewards: string[] | undefined,
  showAll: boolean,
): WeeklyRewardRow[] => {
  const byName = new Map(rows.map((row) => [row.name, row]));
  const names = new Set(shownRewards ?? []);
  if (!shownRewards || showAll) rows.forEach(({ name }) => names.add(name));
  return getAllRewardNames()
    .filter((name) => names.has(name))
    .map((name) => byName.get(name) ?? { name, cleared: NONE, total: NONE });
};
