import { TAB_KEY } from "../constants/Common.constants";
import { LS_KEYS } from "../constants/localStorage.constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import { ExtraPayload, SideBarTab } from "../interface/Common.interface";
import { setSelectedSideBar } from "../slice/UIState.reducer";

// Opens the Character tab, optionally on a given character or a blank form.
const useCharacterNavigation = () => {
  const dispatch = useAppDispatch();
  const isKeepScreen = useAppSelector((state) => state.UIState.isKeepScreen);

  return (characterScreen?: ExtraPayload["characterScreen"]) => {
    const tab: SideBarTab = {
      key: TAB_KEY.mainCharacter,
      name: TAB_KEY.mainCharacter,
    };
    dispatch(setSelectedSideBar({ ...tab, payload: { characterScreen } }));
    if (isKeepScreen) {
      // Payload is left out on purpose: a reload should land on the main
      // character, not on one that may have been deleted since.
      localStorage.setItem(LS_KEYS.last_screen, JSON.stringify(tab));
    }
  };
};

export default useCharacterNavigation;
