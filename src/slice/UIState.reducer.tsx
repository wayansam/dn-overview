import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TAB_LIST } from "../constants/Common.constants";

interface UIState {
  selectedSideBar: string;
}

const initialState: UIState = {
  selectedSideBar: TAB_LIST[0].key,
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
