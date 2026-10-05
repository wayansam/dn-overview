import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  CHARACTER_GROUP_LIMIT,
  CHARACTER_LIMIT,
} from "../constants/Character.constants";
import {
  Character,
  CharacterGroup,
  CharacterStore,
} from "../interface/Account.interface";
import { generateId, loadCharacterStore } from "../utils/characterStorage.util";

// Name uniqueness and field rules are validated by the forms; the reducer
// only guards the hard limits and keeps references consistent.
interface SaveCharacterPayload {
  character: Character;
  isMain: boolean;
}

const applyMain = (
  state: CharacterStore,
  characterId: string,
  isMain: boolean,
) => {
  if (isMain) {
    state.mainCharacterId = characterId;
  } else if (state.mainCharacterId === characterId) {
    state.mainCharacterId = undefined;
  }
};

// `orderedIds` is the new order; items missing from it keep their relative
// order at the end.
const sortByIds = (list: { id: string }[], orderedIds: string[]) => {
  const rank = new Map(orderedIds.map((id, idx) => [id, idx]));
  const getRank = (id: string) => rank.get(id) ?? Number.MAX_SAFE_INTEGER;
  list.sort((a, b) => getRank(a.id) - getRank(b.id));
};

const CharacterSlice = createSlice({
  name: "Character",
  initialState: loadCharacterStore,
  reducers: {
    addCharacter: {
      reducer: (state, action: PayloadAction<SaveCharacterPayload>) => {
        if (state.characters.length >= CHARACTER_LIMIT) return;
        state.characters.push(action.payload.character);
        applyMain(state, action.payload.character.id, action.payload.isMain);
      },
      prepare: (
        character: Omit<Character, "id">,
        isMain: boolean,
      ): { payload: SaveCharacterPayload } => ({
        payload: { character: { ...character, id: generateId() }, isMain },
      }),
    },
    updateCharacter: (state, action: PayloadAction<SaveCharacterPayload>) => {
      const { character, isMain } = action.payload;
      const idx = state.characters.findIndex((item) => item.id === character.id);
      if (idx < 0) return;
      state.characters[idx] = character;
      applyMain(state, character.id, isMain);
    },
    deleteCharacter: (state, action: PayloadAction<string>) => {
      state.characters = state.characters.filter(
        (item) => item.id !== action.payload,
      );
      if (state.mainCharacterId === action.payload) {
        state.mainCharacterId = undefined;
      }
    },
    reorderCharacters: (state, action: PayloadAction<string[]>) => {
      sortByIds(state.characters, action.payload);
    },
    addCharacterGroup: {
      reducer: (state, action: PayloadAction<CharacterGroup>) => {
        if (state.groups.length >= CHARACTER_GROUP_LIMIT) return;
        state.groups.push(action.payload);
      },
      prepare: (name: string) => ({ payload: { id: generateId(), name } }),
    },
    updateCharacterGroup: (state, action: PayloadAction<CharacterGroup>) => {
      const group = state.groups.find((item) => item.id === action.payload.id);
      if (group) group.name = action.payload.name;
    },
    reorderCharacterGroups: (state, action: PayloadAction<string[]>) => {
      sortByIds(state.groups, action.payload);
    },
    // Characters attached to the group are kept, just without an ID.
    deleteCharacterGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter((item) => item.id !== action.payload);
      state.characters.forEach((item) => {
        if (item.groupId === action.payload) item.groupId = undefined;
      });
    },
  },
});

export const CharacterReducer = CharacterSlice.reducer;
export const {
  addCharacter,
  updateCharacter,
  deleteCharacter,
  reorderCharacters,
  addCharacterGroup,
  updateCharacterGroup,
  reorderCharacterGroups,
  deleteCharacterGroup,
} = CharacterSlice.actions;
