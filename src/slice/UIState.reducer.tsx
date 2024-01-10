import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TAB_GROUP_LIST } from "../constants/Common.constants";
import { SideBarTab } from "../interface/Common.interface";

interface UIState {
  selectedSideBar: SideBarTab;
}

const initialState: UIState = {
  selectedSideBar: TAB_GROUP_LIST[0].children[0],
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
  },
});

export const UIStateReducer = UIStateSlice.reducer;
export const { setSelectedSideBar } = UIStateSlice.actions;
