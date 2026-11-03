export interface StageAotReward {
  floor: number;
  title?: string;
  rewards: {
    // common
    "Ancient Broken Dragon Jade Fragment"?: number;

    // 1st
    "Tiger Dragon's Intact Orb (Untradable)"?: number;
    "Tiger Dragon's Broken Orb Fragment"?: number;
    "Butterfly Bubble Coral"?: number;
    "Dragon Fire Flambé Cake"?: number;
    "Warrior Equipment Protection Magic Jelly"?: number;
    "Rune Fragment"?: number;
    "Rune Crystal"?: number;
    "Lunar Eclipse Stigmata"?: number;
    "Lunar Eclipse Fragment x300 Pouch"?: number;
    "Lunar Eclipse Fragment x600 Pouch"?: number;
    "Lunar Eclipse Fragment x1000 Pouch"?: number;
    "Lunar Eclipse Fragment x2000 Pouch"?: number;
    "Lunar Eclipse Fragment x3000 Pouch"?: number;
    "Eternal Enhancement Heraldry (Unique) Selection Pouch"?: number;
    "Ark of Transcendence [Past] Coin"?: number;

    // weekly
    "High Grade Lunar Eclipse Fragment (6 types)"?: number;
    "Lunar Eclipse Fragment (6 types)"?: number;
    "Ancients' Blueprint Fragment"?: number;
    "Hero Coins"?: number;
    "Shiny Hero Coins"?: number;
    "High Purity Core Selection Pouch"?: number;

    // season
    "Future Spacetime Cluster"?: number;
    "Ark Stone Fragment"?: number;
    "Unknown Stone Fragment"?: number;
  };
}

export interface FissionMazeErosionReward {
  floor: string;
  // stored in copper (1g = 100s, 1s = 100c) to keep patch note values exact
  gold: number;
  erosionFragment: number;
  concentratedErosionFragment?: { min: number; max: number };
}

export interface FissionMazeRangeReward {
  name: string;
  min: number;
  max?: number;
}

export interface FissionMazeStageClear {
  floor: string;
  goldenBox: FissionMazeRangeReward[];
  silverBox: FissionMazeRangeReward[];
}

// Nightshade Reward Chest, opened with a Night Shadow Starlight Key.
// Fields left out were not listed in the patch note for that floor.
export interface NSTGChestReward {
  floor: string;
  dragonJadePouch?: string;
  lunarEclipseCrystal?: number;
  lunarEclipseRemains?: number;
  // stored in copper (1g = 100s, 1s = 100c), same as Fission Maze
  gold?: number;
  heroCoins?: number;
  shinyHeroCoins?: number;
}

export interface NSTGResonanceMission {
  // matches NSTGChestReward.floor
  floor: string;
  timeLimit?: string;
  twistedResonanceFragment: number;
}
