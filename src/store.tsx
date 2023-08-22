import { combineReducers, configureStore } from "@reduxjs/toolkit";
import allReducers from "./slice";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";

const rootReducer = combineReducers(allReducers);
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});
sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
