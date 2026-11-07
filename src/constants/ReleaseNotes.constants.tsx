import { SideBarTab } from "../interface/Common.interface";
import { TAB_KEY } from "./Common.constants";

export enum ReleaseType {
  N = "New",
  U = "Update",
  P = "Planned",
  I = "In Progress",
  D = "Done",
  M = "Maintenance",
}

// feature: something the app lets you do (calculators, rewards, tools).
// app: upgrades to the app itself (layout, UI, performance, preferences).
export type ReleaseCategory = "feature" | "app";

export interface ReleaseNote {
  type: ReleaseType;
  label: string;
  category: ReleaseCategory;
  link?: SideBarTab;
  // DD-MM-YYYY
  date?: string;
}

export interface PlannedNote {
  type: ReleaseType;
  label: string;
}

const tab = (key: string, payload?: SideBarTab["payload"]): SideBarTab => ({
  key,
  name: key,
  ...(payload && { payload }),
});

// Add new entries anywhere; the tables sort by date.
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    type: ReleaseType.D,
    category: "feature",
    label:
      "Equipment (Ancient, Kilos, Named EOD), Jade (Lunar, Skill, Erosion), Heraldry (Ancient Goddess), Talisman (Black Dragon, Eternal)",
  },
  {
    type: ReleaseType.D,
    category: "app",
    label:
      "Patch Note link for some existing items in the Help bar (question mark in the bottom right corner)",
  },
  {
    type: ReleaseType.D,
    category: "app",
    label: "Success rate note on all skill jades",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Dimensional Dragon Jade",
    link: tab(TAB_KEY.jadeSkill, { skillJadeScreen: { tabOpen: ["7"] } }),
    date: "03-02-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Ancient Lunar Jade Enhancement Calculator",
    link: tab(TAB_KEY.jadeLunar, { lunarScreen: { tabOpen: ["4"] } }),
    date: "23-02-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Conversion Costume Calculator",
    link: tab(TAB_KEY.miscConversion),
    date: "04-04-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Bone Dragon Armor & Weapon Calculator",
    link: tab(TAB_KEY.eqBoneDragon),
    date: "26-05-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Conversion Costume Armor Legend Enhancement",
    link: tab(TAB_KEY.miscConversion),
    date: "28-05-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Bestie Spirit & Mount Calculator",
    link: tab(TAB_KEY.miscBestie),
    date: "04-07-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Enhancement for Ancient Goddess Heraldry",
    link: tab(TAB_KEY.heraldryAncientGoddes),
    date: "08-07-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "VIP Accessories",
    link: tab(TAB_KEY.eqIonaAcc),
    date: "07-09-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Otherworldly Dragon Jade",
    link: tab(TAB_KEY.jadeSkill, { skillJadeScreen: { tabOpen: ["8"] } }),
    date: "07-09-2025",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Ancient's Equipment cost changes",
    link: tab(TAB_KEY.eqAncient),
    date: "10-09-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Spun Gold Equipment",
    link: tab(TAB_KEY.eqSpunGold),
    date: "12-09-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Collapse Dragon Jade",
    link: tab(TAB_KEY.jadeCollapse),
    date: "25-09-2025",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Spun Gold Equipment - Evolver Mats calculator",
    link: tab(TAB_KEY.eqSpunGold),
    date: "08-10-2025",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Bestie Spirit & Mount v3",
    link: tab(TAB_KEY.miscBestie),
    date: "22-10-2025",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Enhancement Legend Conversion Accessories (+1 to +3)",
    link: tab(TAB_KEY.miscConversion),
    date: "23-10-2025",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Enhancement Iona Accessories (+13 to +15)",
    link: tab(TAB_KEY.eqIonaAcc),
    date: "30-10-2025",
  },
  {
    type: ReleaseType.D,
    category: "feature",
    label: "Arc of Transcendence, Season 2 [Future]",
    link: tab(TAB_KEY.stageArcOfTranscen),
    date: "04-11-2025",
  },
  {
    type: ReleaseType.U,
    category: "app",
    label: "Conversion charts",
    link: tab(TAB_KEY.miscConversion),
    date: "09-11-2025",
  },
  {
    type: ReleaseType.D,
    category: "app",
    label: "Chart visualization",
    date: "09-11-2025",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Arc of Transcendence, Season 3 [Past]",
    link: tab(TAB_KEY.stageArcOfTranscen),
    date: "10-11-2025",
  },
  {
    type: ReleaseType.D,
    category: "app",
    label: "Preference 'Stay on last opened screen'",
    link: tab(TAB_KEY.setting),
    date: "10-11-2025",
  },
  {
    type: ReleaseType.N,
    category: "feature",
    label: "Deeply Rooted Variant Jade",
    link: tab(TAB_KEY.jadeDeepVariant),
    date: "12-11-2025",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "VIP Accessories charts",
    link: tab(TAB_KEY.eqIonaAcc),
    date: "17-11-2025",
  },
  {
    type: ReleaseType.U,
    category: "app",
    label: "Chart visualization can show data by total or by step",
    date: "18-11-2025",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Enhancement Legend Conversion Weapon & WTD (+1 to +3)",
    link: tab(TAB_KEY.miscConversion),
    date: "06-02-2026",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label:
      "Enhancement Legend Conversion Armor (+4 to +7), Weapon, Accessories & WTD (+4 to +6)",
    link: tab(TAB_KEY.miscConversion),
    date: "31-08-2026",
  },
  {
    type: ReleaseType.M,
    category: "app",
    label:
      "Overall app performance improvement, bug fixes, and UI/UX enhancements",
    date: "31-08-2026",
  },
  {
    type: ReleaseType.U,
    category: "app",
    label: "Conversion Suggestion",
    link: tab(TAB_KEY.miscConversion),
    date: "01-09-2026",
  },
  {
    type: ReleaseType.N,
    category: "feature",
    label: "Gold Dragon Armor & Weapon Calculator",
    link: tab(TAB_KEY.eqGoldDragon),
    date: "15-09-2026",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Ark of Transcendence Season 1 to Season 3 [Future] rewards",
    link: tab(TAB_KEY.stageArcOfTranscen),
    date: "15-09-2026",
  },
  {
    type: ReleaseType.N,
    category: "app",
    label: "Compare Equipment stats",
    link: tab(TAB_KEY.mainCompare),
    date: "15-09-2026",
  },
  {
    type: ReleaseType.N,
    category: "feature",
    label: "Brooch Calculator (Velskud, Nerwin, Terramai)",
    link: tab(TAB_KEY.broochTerramai),
    date: "15-09-2026",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Lunar Jade evolve to Collapse Dragon Jade (Unique)",
    link: tab(TAB_KEY.jadeLunar),
    date: "24-09-2026",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Collapse Dragon Jade (Epic) enhancement levels expanded (0-15)",
    link: tab(TAB_KEY.jadeCollapse),
    date: "26-09-2026",
  },
  {
    type: ReleaseType.N,
    category: "feature",
    label: "Fission Maze Erosion rewards (Labyrinth & Ascension)",
    link: tab(TAB_KEY.stageFissionMaze),
    date: "04-10-2026",
  },
  {
    type: ReleaseType.N,
    category: "feature",
    label: "Gold Dragon Jade",
    link: tab(TAB_KEY.jadeGoldDragon),
    date: "04-10-2026",
  },
  {
    type: ReleaseType.U,
    category: "app",
    label: "Character & ID screen shows all characters",
    link: tab(TAB_KEY.mainCharacter),
    date: "05-10-2026",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Ark of Transcendence Season 4 [Past] rewards",
    link: tab(TAB_KEY.stageArcOfTranscen),
    date: "17-10-2026",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Enhancement Legend Conversion Accessories (+7)",
    link: tab(TAB_KEY.miscConversion),
    date: "17-10-2026",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "VIP Accessories renamed to Iona Accessories",
    link: tab(TAB_KEY.eqIonaAcc),
    date: "17-10-2026",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label:
      "Iona Accessories evolution to White Dragon Accessories (+15 to +20)",
    link: tab(TAB_KEY.eqIonaAcc),
    date: "17-10-2026",
  },
  {
    type: ReleaseType.N,
    category: "feature",
    label: "Rubinart Accessories Calculator",
    link: tab(TAB_KEY.eqRubinartAcc),
    date: "17-10-2026",
  },
  {
    type: ReleaseType.N,
    category: "app",
    label:
      "General dashboard with customizable widgets (Characters, IDs, Tasks, Release Notes)",
    link: tab(TAB_KEY.mainGeneral),
    date: "18-10-2026",
  },
  {
    type: ReleaseType.U,
    category: "app",
    label:
      "Character list moved to the Character tab, Details opens the character in a popup",
    link: tab(TAB_KEY.mainCharacter),
    date: "18-10-2026",
  },
  {
    type: ReleaseType.N,
    category: "app",
    label:
      "Task tab: Weekly [Account] & Weekly [Character] checklists with Fission Maze & Ark of Transcendence floors",
    link: tab(TAB_KEY.mainTask),
    date: "18-10-2026",
  },
  {
    type: ReleaseType.N,
    category: "app",
    label: "Weekly reward summary from the picked floors",
    link: tab(TAB_KEY.mainTask),
    date: "18-10-2026",
  },
  {
    type: ReleaseType.N,
    category: "app",
    label:
      "Server time (UTC+8) and automatic weekly reset every Saturday 09:00, with a Last Week summary",
    link: tab(TAB_KEY.mainTask),
    date: "18-10-2026",
  },
  {
    type: ReleaseType.N,
    category: "app",
    label:
      "Backup & Transfer: export / import your data to another browser or device",
    link: tab(TAB_KEY.setting),
    date: "18-10-2026",
  },
  {
    type: ReleaseType.U,
    category: "app",
    label: "Phone friendly layout for the Character & Task tables and widgets",
    date: "18-10-2026",
  },
  {
    type: ReleaseType.N,
    category: "app",
    label:
      "Class icon next to character names for every class, 2nd job & specialization",
    link: tab(TAB_KEY.mainCharacter),
    date: "01-11-2026",
  },
  {
    type: ReleaseType.U,
    category: "app",
    label:
      "Cleaner character name layout, the Main tag no longer breaks the row",
    link: tab(TAB_KEY.mainCharacter),
    date: "01-11-2026",
  },
  {
    type: ReleaseType.N,
    category: "feature",
    label: "Paradox Talisman stats, mats & enhancement calculator",
    link: tab(TAB_KEY.talismanParadox),
    date: "03-11-2026",
  },
  {
    type: ReleaseType.N,
    category: "feature",
    label: "Night Shadow Training Ground chest & Resonance rewards",
    link: tab(TAB_KEY.stageNSTG),
    date: "03-11-2026",
  },
  {
    type: ReleaseType.N,
    category: "feature",
    label: "Golden Enhancement Heraldry stats, mats & crafting calculator",
    link: tab(TAB_KEY.heraldryGolden),
    date: "07-11-2026",
  },
  {
    type: ReleaseType.U,
    category: "feature",
    label: "Paradox Warrior class & skills",
    link: tab(TAB_KEY.mainCharacter),
    date: "07-11-2026",
  },
];

export const PLANNED_NOTES: PlannedNote[] = [
  { type: ReleaseType.P, label: "To Do List" },
  { type: ReleaseType.P, label: "Future feature (beta)" },
  { type: ReleaseType.P, label: "Gear Info" },
];
