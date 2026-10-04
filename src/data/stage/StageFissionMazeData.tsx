import {
  FissionMazeErosionReward,
  FissionMazeRangeReward,
  FissionMazeStageClear,
} from "../../interface/reward.interface";

// gold, silver, copper -> copper
const gsc = (g: number, s = 0, c = 0) => g * 10000 + s * 100 + c;

// Erosion Reward Box, Ascension era (v180 "Maze Difficulty Expansion Rewards")
// 1F-3F are taken from the v81 Labyrinth floors via the v160 mapping
// (19F -> 1F, 22F -> 2F, 24F -> 3F); 3-1F onward is from v180
export const fmErosionAscension: FissionMazeErosionReward[] = [
  {
    floor: "Ascension 1F",
    gold: gsc(3064),
    erosionFragment: 4,
  },
  {
    floor: "Ascension 2F",
    gold: gsc(18975),
    erosionFragment: 32,
    concentratedErosionFragment: { min: 4, max: 12 },
  },
  {
    floor: "Ascension 3F",
    gold: gsc(27324),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 25, max: 75 },
  },
  {
    floor: "Ascension 3-1F",
    gold: gsc(27500),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 30, max: 90 },
  },
  {
    floor: "Ascension 3-2F",
    gold: gsc(27775),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 35, max: 105 },
  },
  {
    floor: "Ascension 3-3F",
    gold: gsc(28052, 75),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 40, max: 120 },
  },
  {
    floor: "Ascension 3-4F",
    gold: gsc(28333, 27, 75),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 45, max: 135 },
  },
  {
    floor: "Ascension 3-5F",
    gold: gsc(28616, 61, 3),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 50, max: 150 },
  },
  {
    floor: "Ascension 3-6F",
    gold: gsc(28902, 77, 64),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 55, max: 165 },
  },
  {
    floor: "Ascension 3-7F",
    gold: gsc(29191, 80, 41),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 60, max: 180 },
  },
  {
    floor: "Ascension 3-8F",
    gold: gsc(29483, 72, 22),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 65, max: 195 },
  },
  {
    floor: "Ascension 4F",
    gold: gsc(29778, 55, 94),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 70, max: 210 },
  },
  {
    floor: "Ascension 4-1F",
    gold: gsc(30076, 34, 50),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 75, max: 225 },
  },
  {
    floor: "Ascension 4-2F",
    gold: gsc(30377, 10, 84),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 80, max: 240 },
  },
  {
    floor: "Ascension 4-3F",
    gold: gsc(30680, 87, 95),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 85, max: 255 },
  },
  {
    floor: "Ascension 4-4F",
    gold: gsc(30987, 68, 83),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 90, max: 270 },
  },
  {
    floor: "Ascension 4-5F",
    gold: gsc(31297, 56, 52),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 95, max: 285 },
  },
  {
    floor: "Ascension 5F",
    gold: gsc(31610, 54, 9),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 100, max: 300 },
  },
  {
    floor: "Ascension 5-1F",
    gold: gsc(31926, 64, 63),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 105, max: 315 },
  },
  {
    floor: "Ascension 5-2F",
    gold: gsc(32245, 91, 27),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 110, max: 330 },
  },
  {
    floor: "Ascension 5-3F",
    gold: gsc(32568, 37, 19),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 115, max: 345 },
  },
  {
    floor: "Ascension 5-4F",
    gold: gsc(32894, 5, 56),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 120, max: 360 },
  },
  {
    floor: "Ascension 5-5F",
    gold: gsc(33222, 99, 61),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 125, max: 375 },
  },
  {
    floor: "Ascension 6F",
    gold: gsc(33555, 22, 61),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 130, max: 390 },
  },
  {
    floor: "Ascension 6-1F",
    gold: gsc(33890, 77, 84),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 135, max: 405 },
  },
  {
    floor: "Ascension 6-2F",
    gold: gsc(34229, 68, 61),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 140, max: 420 },
  },
];

// Erosion Reward Box, Labyrinth era (v81 launch)
export const fmErosionLabyrinth: FissionMazeErosionReward[] = [
  { floor: "Labyrinth 18F", gold: gsc(3064), erosionFragment: 2 },
  { floor: "Labyrinth 19F", gold: gsc(3064), erosionFragment: 4 },
  { floor: "Labyrinth 20F", gold: gsc(11228), erosionFragment: 8 },
  {
    floor: "Labyrinth 21F",
    gold: gsc(14596),
    erosionFragment: 16,
    concentratedErosionFragment: { min: 2, max: 6 },
  },
  {
    floor: "Labyrinth 22F",
    gold: gsc(18975),
    erosionFragment: 32,
    concentratedErosionFragment: { min: 4, max: 12 },
  },
  {
    floor: "Labyrinth 23F",
    gold: gsc(22770),
    erosionFragment: 64,
    concentratedErosionFragment: { min: 10, max: 30 },
  },
  {
    floor: "Labyrinth 24F",
    gold: gsc(27324),
    erosionFragment: 128,
    concentratedErosionFragment: { min: 25, max: 75 },
  },
];

// Stage clear boxes, Labyrinth era (v81)
export const fmStageClearLabyrinth: FissionMazeStageClear[] = [
  {
    floor: "Labyrinth 23F",
    goldenBox: [{ name: "Rune Mana", min: 842, max: 1684 }],
    silverBox: [{ name: "Minos Lebrium", min: 10 }],
  },
  {
    floor: "Labyrinth 24F",
    goldenBox: [{ name: "Rune Mana", min: 1095, max: 2190 }],
    silverBox: [{ name: "Minos Lebrium", min: 10 }],
  },
];

// Weekly conquest rewards (v81, no newer figures published)
export const fmWeeklyConquest: FissionMazeRangeReward[] = [
  { name: "Lebrium Points", min: 90000 },
  { name: "Superb Ancient Wisdom", min: 15 },
  { name: "Maze Fragment", min: 15 },
  { name: "Minos Fragment", min: 10 },
  { name: "Hero Coins", min: 27456, max: 30000 },
];

// Labyrinth -> Ascension mapping (v160)
export const fmLabyrinthAscensionMap: {
  labyrinth: string;
  ascension: string;
}[] = [
  { labyrinth: "Labyrinth 19F", ascension: "Ascension 1F" },
  { labyrinth: "Labyrinth 22F", ascension: "Ascension 2F" },
  { labyrinth: "Labyrinth 24F", ascension: "Ascension 3F" },
];
