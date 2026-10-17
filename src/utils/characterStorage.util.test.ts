import {
  CHARACTER_LEVEL_MAX,
  CHARACTER_LEVEL_MIN,
  CHARACTER_STORE_VERSION,
} from "../constants/Character.constants";
import { LS_KEYS } from "../constants/localStorage.constants";
import { CharacterStore } from "../interface/Account.interface";
import {
  emptyCharacterStore,
  generateId,
  isNameTaken,
  isSameName,
  loadCharacterStore,
  saveCharacterStore,
} from "./characterStorage.util";

const writeRaw = (value: unknown) =>
  localStorage.setItem(
    LS_KEYS.characters,
    typeof value === "string" ? value : JSON.stringify(value)
  );

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("emptyCharacterStore", () => {
  test("returns a fresh store on every call", () => {
    const a = emptyCharacterStore();
    a.characters.push({ id: "x", name: "x", level: 1, classId: "c" });
    expect(emptyCharacterStore()).toEqual({
      version: CHARACTER_STORE_VERSION,
      characters: [],
      groups: [],
    });
  });
});

describe("generateId", () => {
  test("returns unique ids", () => {
    const ids = new Set(Array.from({ length: 50 }, generateId));
    expect(ids.size).toBe(50);
  });

  test("falls back when crypto.randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {});
    try {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
      expect(generateId()).not.toBe(id);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("isSameName / isNameTaken", () => {
  test("compares names case-insensitively, ignoring outer spaces", () => {
    expect(isSameName(" Alice ", "alice")).toBe(true);
    expect(isSameName("Alice", "Alicia")).toBe(false);
  });

  const list = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
  ];

  test("detects a name used by another item", () => {
    expect(isNameTaken(list, "ALICE")).toBe(true);
    expect(isNameTaken(list, "Carol")).toBe(false);
  });

  test("ignores the item being edited", () => {
    expect(isNameTaken(list, "alice", "1")).toBe(false);
    expect(isNameTaken(list, "bob", "1")).toBe(true);
  });
});

describe("loadCharacterStore", () => {
  test("returns an empty store when nothing is saved", () => {
    expect(loadCharacterStore()).toEqual(emptyCharacterStore());
  });

  test.each([
    ["invalid JSON", "{not json"],
    ["a JSON primitive", "42"],
    ["JSON null", "null"],
  ])("returns an empty store for %s", (_, raw) => {
    writeRaw(raw);
    expect(loadCharacterStore()).toEqual(emptyCharacterStore());
  });

  test("loads a valid store unchanged", () => {
    const store: CharacterStore = {
      version: CHARACTER_STORE_VERSION,
      groups: [{ id: "g1", name: "Main ID" }],
      characters: [
        { id: "c1", name: "Alice", level: 95, classId: "k1", groupId: "g1" },
        { id: "c2", name: "Bob", level: 1, classId: "k2" },
      ],
      mainCharacterId: "c2",
    };
    writeRaw(store);
    expect(loadCharacterStore()).toEqual(store);
  });

  test("drops malformed characters and groups but keeps the rest", () => {
    writeRaw({
      groups: [{ id: "g1", name: "ok" }, { id: 2, name: "bad id" }, "nope"],
      characters: [
        { id: "c1", name: "ok", level: 50, classId: "k" },
        { id: "c2", name: "no level", classId: "k" },
        { id: "c3", name: "string level", level: "50", classId: "k" },
        null,
      ],
    });
    const store = loadCharacterStore();
    expect(store.groups).toEqual([{ id: "g1", name: "ok" }]);
    expect(store.characters.map((c) => c.id)).toEqual(["c1"]);
  });

  test("treats non-array lists as empty", () => {
    writeRaw({ groups: "x", characters: { id: "c1" } });
    const store = loadCharacterStore();
    expect(store.groups).toEqual([]);
    expect(store.characters).toEqual([]);
  });

  test("clamps levels into the allowed range", () => {
    writeRaw({
      characters: [
        { id: "low", name: "a", level: -5, classId: "k" },
        { id: "high", name: "b", level: 999, classId: "k" },
      ],
    });
    const levels = loadCharacterStore().characters.map((c) => c.level);
    expect(levels).toEqual([CHARACTER_LEVEL_MIN, CHARACTER_LEVEL_MAX]);
  });

  test("detaches characters from groups that no longer exist", () => {
    writeRaw({
      groups: [{ id: "g1", name: "kept" }],
      characters: [
        { id: "c1", name: "a", level: 1, classId: "k", groupId: "g1" },
        { id: "c2", name: "b", level: 1, classId: "k", groupId: "gone" },
        { id: "c3", name: "c", level: 1, classId: "k", groupId: 7 },
      ],
    });
    const groupIds = loadCharacterStore().characters.map((c) => c.groupId);
    expect(groupIds).toEqual(["g1", undefined, undefined]);
  });

  test("drops a main character id that points nowhere", () => {
    writeRaw({
      characters: [{ id: "c1", name: "a", level: 1, classId: "k" }],
      mainCharacterId: "deleted",
    });
    expect(loadCharacterStore().mainCharacterId).toBeUndefined();
  });

  test("always stamps the current version", () => {
    writeRaw({ version: 0, characters: [], groups: [] });
    expect(loadCharacterStore().version).toBe(CHARACTER_STORE_VERSION);
  });
});

describe("saveCharacterStore", () => {
  test("round-trips through loadCharacterStore", () => {
    const store: CharacterStore = {
      version: CHARACTER_STORE_VERSION,
      groups: [{ id: "g1", name: "ID" }],
      characters: [
        { id: "c1", name: "a", level: 10, classId: "k", groupId: "g1" },
      ],
      mainCharacterId: "c1",
    };
    saveCharacterStore(store);
    expect(loadCharacterStore()).toEqual(store);
  });

  test("does not throw when storage is full or blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => saveCharacterStore(emptyCharacterStore())).not.toThrow();
  });
});
