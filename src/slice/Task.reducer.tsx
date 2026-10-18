import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TASK_LIMIT } from "../constants/Task.constants";
import { TaskEntry, TaskStore } from "../interface/Task.interface";
import { generateId } from "../utils/characterStorage.util";
import { loadTaskStore } from "../utils/taskStorage.util";
import {
  clearBeforeReset,
  getLastReset,
  getServerTimestamp,
} from "../utils/weeklyReset.util";

const TaskSlice = createSlice({
  name: "Task",
  initialState: loadTaskStore,
  reducers: {
    addTask: {
      reducer: (state, action: PayloadAction<TaskEntry>) => {
        const count = state.entries.filter(
          (item) => item.category === action.payload.category,
        ).length;
        if (count >= TASK_LIMIT) return;
        state.entries.push(action.payload);
      },
      prepare: (entry: Omit<TaskEntry, "id" | "lastCleared">) => ({
        payload: { ...entry, id: generateId() },
      }),
    },
    // Records now (server time) as the clear time.
    markTaskDone: {
      reducer: (state, action: PayloadAction<{ id: string; date: string }>) => {
        const entry = state.entries.find(
          (item) => item.id === action.payload.id,
        );
        if (entry) entry.lastCleared = action.payload.date;
      },
      prepare: (id: string) => ({
        payload: { id, date: getServerTimestamp() },
      }),
    },
    // Clears everything done before the latest weekly reset.
    applyWeeklyReset: {
      reducer: (state, action: PayloadAction<number>) => {
        clearBeforeReset(state, action.payload);
      },
      prepare: () => ({ payload: getLastReset() }),
    },
    resetTask: (state, action: PayloadAction<string>) => {
      const entry = state.entries.find((item) => item.id === action.payload);
      if (entry) entry.lastCleared = undefined;
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(
        (item) => item.id !== action.payload,
      );
    },
    // Checking records today, unchecking removes the date.
    setActivityCleared: {
      reducer: (
        state,
        action: PayloadAction<{
          characterId: string;
          activityId: string;
          date?: string;
        }>,
      ) => {
        const { characterId, activityId, date } = action.payload;
        const clears = { ...state.characterClears[characterId] };
        if (date) {
          clears[activityId] = date;
        } else {
          delete clears[activityId];
        }
        if (Object.keys(clears).length) {
          state.characterClears[characterId] = clears;
        } else {
          delete state.characterClears[characterId];
        }
      },
      prepare: (characterId: string, activityId: string, checked: boolean) => ({
        payload: {
          characterId,
          activityId,
          date: checked ? getServerTimestamp() : undefined,
        },
      }),
    },
    // Clearing (no floor) removes the entry.
    setActivityFloor: (
      state,
      action: PayloadAction<{
        characterId: string;
        activityId: string;
        floor?: string;
      }>,
    ) => {
      const { characterId, activityId, floor } = action.payload;
      const floors = { ...state.characterFloors[characterId] };
      if (floor) {
        floors[activityId] = floor;
      } else {
        delete floors[activityId];
      }
      if (Object.keys(floors).length) {
        state.characterFloors[characterId] = floors;
      } else {
        delete state.characterFloors[characterId];
      }
    },
    // Unchecks every activity; the chosen floors are kept.
    resetCharacterActivities: (state, action: PayloadAction<string>) => {
      delete state.characterClears[action.payload];
    },
    saveWeeklyCharacterSetting: (
      state,
      action: PayloadAction<
        Pick<TaskStore, "excludedCharacters" | "hiddenActivities">
      >,
    ) => {
      state.excludedCharacters = action.payload.excludedCharacters;
      state.hiddenActivities = action.payload.hiddenActivities;
    },
    setShownRewards: (state, action: PayloadAction<string[]>) => {
      state.shownRewards = action.payload;
    },
  },
});

export const TaskReducer = TaskSlice.reducer;
export const {
  addTask,
  markTaskDone,
  applyWeeklyReset,
  resetTask,
  deleteTask,
  setActivityCleared,
  setActivityFloor,
  resetCharacterActivities,
  saveWeeklyCharacterSetting,
  setShownRewards,
} = TaskSlice.actions;
