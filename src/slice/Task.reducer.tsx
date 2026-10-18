import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TaskEntry } from "../interface/Task.interface";
import { generateId } from "../utils/characterStorage.util";
import { getToday, loadTaskStore } from "../utils/taskStorage.util";

const TaskSlice = createSlice({
  name: "Task",
  initialState: loadTaskStore,
  reducers: {
    addTask: {
      reducer: (state, action: PayloadAction<TaskEntry>) => {
        state.entries.push(action.payload);
      },
      prepare: (entry: Omit<TaskEntry, "id" | "lastCleared">) => ({
        payload: { ...entry, id: generateId() },
      }),
    },
    // Records today as the clear date.
    markTaskDone: {
      reducer: (
        state,
        action: PayloadAction<{ id: string; date: string }>,
      ) => {
        const entry = state.entries.find(
          (item) => item.id === action.payload.id,
        );
        if (entry) entry.lastCleared = action.payload.date;
      },
      prepare: (id: string) => ({ payload: { id, date: getToday() } }),
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
  },
});

export const TaskReducer = TaskSlice.reducer;
export const { addTask, markTaskDone, resetTask, deleteTask } =
  TaskSlice.actions;
