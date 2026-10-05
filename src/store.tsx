import { combineReducers, configureStore } from "@reduxjs/toolkit";
import allReducers from "./slice";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";
import { saveCharacterStore } from "./utils/characterStorage.util";

const rootReducer = combineReducers(allReducers);
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});
sagaMiddleware.run(rootSaga);

// Persist character data whenever its slice changes (immutable updates mean
// a reference check is enough).
let lastCharacterState = store.getState().Character;
store.subscribe(() => {
  const { Character } = store.getState();
  if (Character !== lastCharacterState) {
    lastCharacterState = Character;
    saveCharacterStore(Character);
  }
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
