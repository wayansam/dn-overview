import {
  NSTGChestReward,
  NSTGResonanceMission,
} from "../../interface/reward.interface";

// gold, silver, copper -> copper
const gsc = (g: number, s = 0, c = 0) => g * 10000 + s * 100 + c;

const moonlightPouch = (floor: string) =>
  `Moonlight-Filled Lunar Eclipse Dragon Jade Pouch (${floor})`;
const dimensionPouch = (floor: number) =>
  `Lunar Eclipse Dragon Jade Pouch (Dimension Labyrinth ${floor}F)`;

// Nightshade Reward Chest, Labyrinth era (v150 launch)
// The patch note lists one "Lunar Eclipse Crystal/Remains" amount, given for each
export const nstgChestLabyrinth: NSTGChestReward[] = [
  ...[
    { lb: 15, le: 10, gold: 3923 },
    { lb: 16, le: 20, gold: 4985 },
    { lb: 17, le: 30, gold: 6313 },
    { lb: 18, le: 40, gold: 7973 },
    { lb: 19, le: 50, gold: 10048 },
    { lb: 20, le: 60, gold: 12641 },
    { lb: 21, le: 70, gold: 15883 },
    { lb: 22, le: 80, gold: 19935 },
    { lb: 23, le: 90, gold: 25000 },
    { lb: 24, le: 100, gold: 25000 },
    { lb: 25, le: 100, gold: 25000 },
    { lb: 26, le: 100, gold: 25000 },
    { lb: 27, le: 100, gold: 25000 },
    { lb: 28, le: 100, gold: 25000 },
    { lb: 29, le: 100, gold: 25000 },
    { lb: 30, le: 100, gold: 25000 },
  ].map(
    ({ lb, le, gold }): NSTGChestReward => ({
      floor: `Labyrinth ${lb}F`,
      dragonJadePouch: moonlightPouch(lb <= 23 ? `${lb}F` : "Top Floor"),
      lunarEclipseCrystal: le,
      lunarEclipseRemains: le,
      gold: gsc(gold),
    })
  ),
  // The patch note lists 50,000 / 60,000 Gold here, given in game as
  // Shiny Hero Coins (1 coin = 10,000 gold)
  ...[
    { dim: 1, le: 150, shinyHeroCoins: 5 },
    { dim: 2, le: 155, shinyHeroCoins: 5 },
    { dim: 3, le: 160, shinyHeroCoins: 6 },
    { dim: 4, le: 165, shinyHeroCoins: 6 },
  ].map(
    ({ dim, le, shinyHeroCoins }): NSTGChestReward => ({
      floor: `Dimension Labyrinth ${dim}F`,
      dragonJadePouch: dimensionPouch(dim),
      lunarEclipseCrystal: le,
      lunarEclipseRemains: le,
      shinyHeroCoins,
    })
  ),
];

const fromLabyrinth = (floor: string, labyrinth: string): NSTGChestReward => ({
  ...nstgChestLabyrinth.find((it) => it.floor === labyrinth)!,
  floor,
});

const ascensionSplitFloors = [
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `Ascension 3-${n}F`),
  "Ascension 4F",
  ...[1, 2, 3, 4, 5].map((n) => `Ascension 4-${n}F`),
  "Ascension 5F",
  ...[1, 2, 3, 4, 5].map((n) => `Ascension 5-${n}F`),
  "Ascension 6F",
  ...[1, 2].map((n) => `Ascension 6-${n}F`),
];

// Nightshade Reward Chest, Ascension era
// 1F-3F and Dimension 1F-4F are the v150 floors via the v160 reward mapping
// (19F -> 1F, 22F -> 2F, 24F -> 3F); 3-1F to 6-2F are from the v180
// "Difficulty Split" and Dimension 5F-14F from the v180 Starlight Key rewards
export const nstgChestAscension: NSTGChestReward[] = [
  fromLabyrinth("Ascension 1F", "Labyrinth 19F"),
  fromLabyrinth("Ascension 2F", "Labyrinth 22F"),
  fromLabyrinth("Ascension 3F", "Labyrinth 24F"),
  ...ascensionSplitFloors.map(
    (floor): NSTGChestReward => ({
      floor,
      heroCoins: 25000,
      lunarEclipseCrystal: 100,
      lunarEclipseRemains: 100,
    })
  ),
  ...[1, 2, 3, 4].map((dim) =>
    fromLabyrinth(`Dimension ${dim}F`, `Dimension Labyrinth ${dim}F`)
  ),
  ...[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(
    (dim): NSTGChestReward => ({
      floor: `Dimension ${dim}F`,
      shinyHeroCoins: 6,
      dragonJadePouch: dimensionPouch(4),
      lunarEclipseCrystal: 165,
      lunarEclipseRemains: 165,
    })
  ),
];

// Resonance Missions - Paradox Frozen Dragon Nest (v197)
export const nstgResonanceMission: NSTGResonanceMission[] = [
  { floor: "Ascension 4F", twistedResonanceFragment: 1 },
  { floor: "Ascension 4-2F", twistedResonanceFragment: 1 },
  { floor: "Ascension 4-4F", twistedResonanceFragment: 1 },
  { floor: "Ascension 5F", twistedResonanceFragment: 1 },
  { floor: "Ascension 5-2F", twistedResonanceFragment: 1 },
  { floor: "Ascension 5-4F", twistedResonanceFragment: 1 },
  { floor: "Ascension 6F", twistedResonanceFragment: 2 },
  { floor: "Ascension 6-2F", twistedResonanceFragment: 2 },
  { floor: "Dimension 1F", twistedResonanceFragment: 2 },
  { floor: "Dimension 2F", twistedResonanceFragment: 2 },
  { floor: "Dimension 3F", twistedResonanceFragment: 2 },
  { floor: "Dimension 4F", twistedResonanceFragment: 2 },
  { floor: "Dimension 5F", twistedResonanceFragment: 3 },
  { floor: "Dimension 6F", twistedResonanceFragment: 3 },
  { floor: "Dimension 7F", twistedResonanceFragment: 3 },
  { floor: "Dimension 7F", timeLimit: "4 min", twistedResonanceFragment: 3 },
  { floor: "Dimension 8F", twistedResonanceFragment: 3 },
  { floor: "Dimension 8F", timeLimit: "4 min", twistedResonanceFragment: 3 },
  {
    floor: "Dimension 8F",
    timeLimit: "3 min 30 sec",
    twistedResonanceFragment: 4,
  },
  { floor: "Dimension 9F", twistedResonanceFragment: 4 },
  { floor: "Dimension 9F", timeLimit: "4 min", twistedResonanceFragment: 4 },
  {
    floor: "Dimension 9F",
    timeLimit: "3 min 30 sec",
    twistedResonanceFragment: 4,
  },
  { floor: "Dimension 10F", twistedResonanceFragment: 4 },
  { floor: "Dimension 10F", timeLimit: "4 min", twistedResonanceFragment: 4 },
  { floor: "Dimension 11F", twistedResonanceFragment: 5 },
  { floor: "Dimension 12F", twistedResonanceFragment: 5 },
  { floor: "Dimension 13F", twistedResonanceFragment: 5 },
  { floor: "Dimension 14F", twistedResonanceFragment: 5 },
];

// Labyrinth -> Ascension reward mapping (v160)
export const nstgLabyrinthAscensionMap: {
  labyrinth: string;
  ascension: string;
}[] = [
  { labyrinth: "Labyrinth 19F", ascension: "Ascension 1F" },
  { labyrinth: "Labyrinth 22F", ascension: "Ascension 2F" },
  { labyrinth: "Labyrinth 24F", ascension: "Ascension 3F" },
  { labyrinth: "Labyrinth 26F", ascension: "Ascension 4F" },
  { labyrinth: "Labyrinth 28F", ascension: "Ascension 5F" },
  { labyrinth: "Labyrinth 30F", ascension: "Ascension 6F" },
  { labyrinth: "Dimension Labyrinth 1F-4F", ascension: "Dimension 1F-4F" },
];
