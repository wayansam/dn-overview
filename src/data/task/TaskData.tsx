import { TaskCategory, TaskInfo } from "../../interface/Task.interface";
import { aotRewardS4PastWeek } from "../stage/StageAoTData";
import { fmErosionAscension } from "../stage/StageFissionMazeData";

// Floors from the Stage screens, latest era / season only: Fission Maze
// Ascension (v180) and Ark of Transcendence Season 4 [Past]. Update these
// when a new era or season is added.
const fissionMazeFloors = fmErosionAscension.map(({ floor }) => ({
  label: floor,
  value: floor,
}));
const aotFloors = aotRewardS4PastWeek.map(({ floor }) => ({
  label: `${floor}F`,
  value: String(floor),
}));

// Task ids are persisted in localStorage (TaskEntry.taskId), so never rename
// an existing id; changing the name is fine.
export const TaskData: TaskInfo[] = [
  { id: "chaosDuelNest", name: "Chaos Duel Nest", category: "weeklyAccount" },
  {
    id: "frozenDragonNest",
    name: "Frozen Dragon Nest",
    category: "weeklyAccount",
  },
  {
    id: "blackDragonNestTrialHard",
    name: "Black Dragon Nest Trial Hard",
    category: "weeklyAccount",
  },
  {
    id: "rainingBlossomsArena",
    name: "Raining Blossoms Exhibition Arena",
    category: "weeklyAccount",
  },
  {
    id: "boneDragonNestHard",
    name: "Bone Dragon Nest Hard",
    category: "weeklyAccount",
  },
  { id: "goldDragonNest", name: "Gold Dragon Nest", category: "weeklyAccount" },
  {
    id: "goldDragonNestHardcore",
    name: "Gold Dragon Nest Hardcore",
    category: "weeklyAccount",
  },
  {
    id: "fissionMaze",
    name: "Fission Maze",
    category: "weeklyCharacter",
    floors: fissionMazeFloors,
  },
  {
    id: "arkOfTranscendence",
    name: "Ark of Transcendence",
    category: "weeklyCharacter",
    floors: aotFloors,
  },
  { id: "nightmare", name: "Nightmare", category: "weeklyCharacter" },
];

export const getTaskById = (id?: string) =>
  TaskData.find((item) => item.id === id);

export const getTasksByCategory = (category: TaskCategory) =>
  TaskData.filter((item) => item.category === category);
