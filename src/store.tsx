import { combineReducers, configureStore } from "@reduxjs/toolkit";
import allReducers from "./slice";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";
import { saveCharacterStore } from "./utils/characterStorage.util";
import { saveTaskStore } from "./utils/taskStorage.util";

const rootReducer = combineReducers(allReducers);
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});
sagaMiddleware.run(rootSaga);

// Persist character and task data whenever their slice changes (immutable
// updates mean a reference check is enough).
let lastCharacterState = store.getState().Character;
let lastTaskState = store.getState().Task;
store.subscribe(() => {
  const { Character, Task } = store.getState();
  if (Character !== lastCharacterState) {
    lastCharacterState = Character;
    saveCharacterStore(Character);
  }
  if (Task !== lastTaskState) {
    lastTaskState = Task;
    saveTaskStore(Task);
  }
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
