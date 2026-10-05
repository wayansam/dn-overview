import {
  CHARACTER_LEVEL_MAX,
  CHARACTER_LEVEL_MIN,
  CHARACTER_STORE_VERSION,
} from "../constants/Character.constants";
import { LS_KEYS } from "../constants/localStorage.constants";
import {
  Character,
  CharacterGroup,
  CharacterStore,
} from "../interface/Account.interface";

export const emptyCharacterStore = (): CharacterStore => ({
  version: CHARACTER_STORE_VERSION,
  characters: [],
  groups: [],
});

export const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

export const isSameName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

export const isNameTaken = (
  list: { id: string; name: string }[],
  name: string,
  excludeId?: string,
) => list.some((item) => item.id !== excludeId && isSameName(item.name, name));

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toGroup = (value: unknown): CharacterGroup | null => {
  if (!isObject(value)) return null;
  const { id, name } = value;
  if (typeof id !== "string" || typeof name !== "string") return null;
  return { id, name };
};

const toCharacter = (value: unknown): Character | null => {
  if (!isObject(value)) return null;
  const { id, name, level, classId, groupId } = value;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof level !== "number" ||
    typeof classId !== "string"
  ) {
    return null;
  }
  return {
    id,
    name,
    level: Math.min(CHARACTER_LEVEL_MAX, Math.max(CHARACTER_LEVEL_MIN, level)),
    classId,
    groupId: typeof groupId === "string" ? groupId : undefined,
  };
};

// Never throws: corrupted or hand-edited storage falls back to what can be
// salvaged, and dangling references (group / main character) are dropped.
export const loadCharacterStore = (): CharacterStore => {
  try {
    const raw = localStorage.getItem(LS_KEYS.characters);
    if (!raw) return emptyCharacterStore();
    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) return emptyCharacterStore();

    const groups = (Array.isArray(parsed.groups) ? parsed.groups : [])
      .map(toGroup)
      .filter((item): item is CharacterGroup => !!item);
    const groupIds = new Set(groups.map((item) => item.id));

    const characters = (
      Array.isArray(parsed.characters) ? parsed.characters : []
    )
      .map(toCharacter)
      .filter((item): item is Character => !!item)
      .map((item) =>
        item.groupId && !groupIds.has(item.groupId)
          ? { ...item, groupId: undefined }
          : item,
      );

    const mainCharacterId =
      typeof parsed.mainCharacterId === "string" &&
      characters.some((item) => item.id === parsed.mainCharacterId)
        ? parsed.mainCharacterId
        : undefined;

    return {
      version: CHARACTER_STORE_VERSION,
      characters,
      groups,
      mainCharacterId,
    };
  } catch {
    return emptyCharacterStore();
  }
};

export const saveCharacterStore = (store: CharacterStore) => {
  try {
    localStorage.setItem(LS_KEYS.characters, JSON.stringify(store));
  } catch {
    // Storage full or blocked (private mode): keep working in memory.
  }
};
