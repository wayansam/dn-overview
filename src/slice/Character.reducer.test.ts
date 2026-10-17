import {
  CHARACTER_GROUP_LIMIT,
  CHARACTER_LIMIT,
  CHARACTER_STORE_VERSION,
} from "../constants/Character.constants";
import { Character, CharacterStore } from "../interface/Account.interface";
import {
  addCharacter,
  addCharacterGroup,
  CharacterReducer,
  deleteCharacter,
  deleteCharacterGroup,
  reorderCharacterGroups,
  reorderCharacters,
  updateCharacter,
  updateCharacterGroup,
} from "./Character.reducer";

const char = (id: string, extra: Partial<Character> = {}): Character => ({
  id,
  name: `name-${id}`,
  level: 1,
  classId: "k",
  ...extra,
});

const store = (extra: Partial<CharacterStore> = {}): CharacterStore => ({
  version: CHARACTER_STORE_VERSION,
  characters: [],
  groups: [],
  ...extra,
});

const ids = (list: { id: string }[]) => list.map((item) => item.id);

beforeEach(() => localStorage.clear());

test("initial state is loaded from localStorage", () => {
  const state = CharacterReducer(undefined, { type: "@@INIT" });
  expect(state).toEqual(store());
});

describe("addCharacter", () => {
  test("assigns a new id and appends the character", () => {
    const action = addCharacter({ name: "Alice", level: 90, classId: "k" }, false);
    expect(action.payload.character.id).toEqual(expect.any(String));

    const state = CharacterReducer(store({ characters: [char("a")] }), action);
    expect(state.characters).toHaveLength(2);
    expect(state.characters[1]).toEqual(action.payload.character);
    expect(state.mainCharacterId).toBeUndefined();
  });

  test("marks the new character as main when asked", () => {
    const action = addCharacter({ name: "Alice", level: 1, classId: "k" }, true);
    const state = CharacterReducer(store({ mainCharacterId: "old" }), action);
    expect(state.mainCharacterId).toBe(action.payload.character.id);
  });

  test("ignores additions past the character limit", () => {
    const full = store({
      characters: Array.from({ length: CHARACTER_LIMIT }, (_, i) => char(`${i}`)),
    });
    const state = CharacterReducer(
      full,
      addCharacter({ name: "extra", level: 1, classId: "k" }, true)
    );
    expect(state).toBe(full);
  });
});

describe("updateCharacter", () => {
  const initial = store({
    characters: [char("a"), char("b")],
    mainCharacterId: "a",
  });

  test("replaces the matching character", () => {
    const edited = char("b", { name: "renamed", level: 70 });
    const state = CharacterReducer(
      initial,
      updateCharacter({ character: edited, isMain: false })
    );
    expect(state.characters[1]).toEqual(edited);
    expect(state.mainCharacterId).toBe("a");
  });

  test("can promote a character to main", () => {
    const state = CharacterReducer(
      initial,
      updateCharacter({ character: char("b"), isMain: true })
    );
    expect(state.mainCharacterId).toBe("b");
  });

  test("clears main only when unticking the current main", () => {
    const unset = CharacterReducer(
      initial,
      updateCharacter({ character: char("a"), isMain: false })
    );
    expect(unset.mainCharacterId).toBeUndefined();
  });

  test("ignores unknown ids", () => {
    const state = CharacterReducer(
      initial,
      updateCharacter({ character: char("zzz"), isMain: true })
    );
    expect(state).toBe(initial);
  });
});

describe("deleteCharacter", () => {
  test("removes the character and clears main if it was main", () => {
    const state = CharacterReducer(
      store({ characters: [char("a"), char("b")], mainCharacterId: "a" }),
      deleteCharacter("a")
    );
    expect(ids(state.characters)).toEqual(["b"]);
    expect(state.mainCharacterId).toBeUndefined();
  });

  test("keeps main when deleting another character", () => {
    const state = CharacterReducer(
      store({ characters: [char("a"), char("b")], mainCharacterId: "a" }),
      deleteCharacter("b")
    );
    expect(state.mainCharacterId).toBe("a");
  });
});

describe("reorder", () => {
  test("sorts characters by the given ids", () => {
    const state = CharacterReducer(
      store({ characters: [char("a"), char("b"), char("c")] }),
      reorderCharacters(["c", "a", "b"])
    );
    expect(ids(state.characters)).toEqual(["c", "a", "b"]);
  });

  test("keeps unlisted items at the end in their original order", () => {
    const state = CharacterReducer(
      store({ characters: [char("a"), char("b"), char("c"), char("d")] }),
      reorderCharacters(["d", "b"])
    );
    expect(ids(state.characters)).toEqual(["d", "b", "a", "c"]);
  });

  test("sorts groups by the given ids", () => {
    const state = CharacterReducer(
      store({
        groups: [
          { id: "g1", name: "1" },
          { id: "g2", name: "2" },
        ],
      }),
      reorderCharacterGroups(["g2", "g1"])
    );
    expect(ids(state.groups)).toEqual(["g2", "g1"]);
  });
});

describe("groups", () => {
  test("addCharacterGroup assigns an id", () => {
    const state = CharacterReducer(store(), addCharacterGroup("Main ID"));
    expect(state.groups).toEqual([{ id: expect.any(String), name: "Main ID" }]);
  });

  test("addCharacterGroup ignores additions past the group limit", () => {
    const full = store({
      groups: Array.from({ length: CHARACTER_GROUP_LIMIT }, (_, i) => ({
        id: `g${i}`,
        name: `${i}`,
      })),
    });
    expect(CharacterReducer(full, addCharacterGroup("extra"))).toBe(full);
  });

  test("updateCharacterGroup renames the matching group only", () => {
    const state = CharacterReducer(
      store({
        groups: [
          { id: "g1", name: "old" },
          { id: "g2", name: "other" },
        ],
      }),
      updateCharacterGroup({ id: "g1", name: "new" })
    );
    expect(state.groups.map((g) => g.name)).toEqual(["new", "other"]);
  });

  test("deleteCharacterGroup keeps its characters but detaches them", () => {
    const state = CharacterReducer(
      store({
        groups: [
          { id: "g1", name: "1" },
          { id: "g2", name: "2" },
        ],
        characters: [char("a", { groupId: "g1" }), char("b", { groupId: "g2" })],
      }),
      deleteCharacterGroup("g1")
    );
    expect(ids(state.groups)).toEqual(["g2"]);
    expect(state.characters.map((c) => c.groupId)).toEqual([undefined, "g2"]);
  });
});
