import { LS_KEYS } from "../constants/localStorage.constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import { SideBarTab } from "../interface/Common.interface";
import { setSelectedSideBar } from "../slice/UIState.reducer";

// Opens a sidebar tab, remembering it when keep-screen is on (like clicking
// it in the sidebar).
const useTabNavigation = () => {
  const dispatch = useAppDispatch();
  const isKeepScreen = useAppSelector((state) => state.UIState.isKeepScreen);

  return (key: string) => {
    const tab: SideBarTab = { key, name: key };
    dispatch(setSelectedSideBar(tab));
    if (isKeepScreen) {
      localStorage.setItem(LS_KEYS.last_screen, JSON.stringify(tab));
    }
  };
};

export default useTabNavigation;
