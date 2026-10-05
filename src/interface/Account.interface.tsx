import {
  CHARACTER_2NDJOB,
  CHARACTER_CLASS,
  SKILL_SLOT,
} from "../constants/InGame.constants";

// Static reference data (src/data/character/ClassData.tsx).
export interface ClassInfo {
  id: string;
  name: string;
  baseClass: CHARACTER_CLASS;
  secondJob: CHARACTER_2NDJOB;
}

export interface ClassSkill {
  id: string;
  classId: string;
  slot: SKILL_SLOT;
  name: string;
}

// User data, persisted to localStorage (src/utils/characterStorage.util.tsx).
export interface Character {
  id: string;
  name: string;
  level: number;
  classId: string;
  groupId?: string;
}

// Shown as "ID" in the UI: an in-game account holding several characters.
export interface CharacterGroup {
  id: string;
  name: string;
}

export interface CharacterStore {
  version: number;
  characters: Character[];
  groups: CharacterGroup[];
  mainCharacterId?: string;
}
