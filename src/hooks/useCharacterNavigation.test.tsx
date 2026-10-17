import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { TAB_KEY } from "../constants/Common.constants";
import { LS_KEYS } from "../constants/localStorage.constants";
import { setIsKeepScreen, UIStateReducer } from "../slice/UIState.reducer";
import useCharacterNavigation from "./useCharacterNavigation";

const setup = (isKeepScreen: boolean) => {
  const store = configureStore({ reducer: { UIState: UIStateReducer } });
  store.dispatch(setIsKeepScreen(isKeepScreen));
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(() => useCharacterNavigation(), { wrapper });
  return { store, navigate: result.current };
};

beforeEach(() => localStorage.clear());

test("opens the Character tab with the requested screen", () => {
  const { store, navigate } = setup(false);
  act(() => navigate({ characterId: "c1" }));

  expect(store.getState().UIState.selectedSideBar).toEqual({
    key: TAB_KEY.mainCharacter,
    name: TAB_KEY.mainCharacter,
    payload: { characterScreen: { characterId: "c1" } },
  });
});

test("does not remember the screen unless keep-screen is on", () => {
  const { navigate } = setup(false);
  act(() => navigate({ isNew: true }));
  expect(localStorage.getItem(LS_KEYS.last_screen)).toBeNull();
});

test("remembers the tab without its payload when keep-screen is on", () => {
  const { navigate } = setup(true);
  act(() => navigate({ characterId: "c1" }));

  expect(JSON.parse(localStorage.getItem(LS_KEYS.last_screen)!)).toEqual({
    key: TAB_KEY.mainCharacter,
    name: TAB_KEY.mainCharacter,
  });
});
