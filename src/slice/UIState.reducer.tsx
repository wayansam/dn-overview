import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TAB_GROUP_LIST } from "../constants/Common.constants";
import { SideBarTab } from "../interface/Common.interface";

interface UIState {
  selectedSideBar: SideBarTab;
  isDarkMode: boolean;
}

const initialState: UIState = {
  selectedSideBar: TAB_GROUP_LIST[0].children[0],
  isDarkMode: true,
};

const UIStateSlice = createSlice({
  name: "UIState",
  initialState: initialState,
  reducers: {
    setSelectedSideBar: (
      state,
      action: PayloadAction<UIState["selectedSideBar"]>
    ) => {
      state.selectedSideBar = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<UIState["isDarkMode"]>) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const UIStateReducer = UIStateSlice.reducer;
export const { setSelectedSideBar, setIsDarkMode } = UIStateSlice.actions;
