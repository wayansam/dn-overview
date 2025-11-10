import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { TAB_GROUP_LIST } from "../constants/Common.constants";
import { SideBarTab } from "../interface/Common.interface";

export interface ImageData {
  url: string;
  onTop: boolean;
  stickyWall: boolean;
}
interface UIState {
  selectedSideBar: SideBarTab;
  isDarkMode: boolean;
  isImgEnabled: boolean;
  imgData: ImageData | null;
  isCollapsedSideBar: boolean;
  isKeepScreen: boolean;
}

const initialState: UIState = {
  selectedSideBar: TAB_GROUP_LIST[0].children[0],
  isDarkMode: true,
  isImgEnabled: false,
  imgData: null,
  isCollapsedSideBar: true,
  isKeepScreen: false,
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
    setIsImgEnabled: (
      state,
      action: PayloadAction<UIState["isImgEnabled"]>
    ) => {
      state.isImgEnabled = action.payload;
    },
    setImgData: (state, action: PayloadAction<UIState["imgData"]>) => {
      state.imgData = action.payload;
    },
    setIsCollapsedSideBar: (
      state,
      action: PayloadAction<UIState["isCollapsedSideBar"]>
    ) => {
      state.isCollapsedSideBar = action.payload;
    },
    setIsKeepScreen: (
      state,
      action: PayloadAction<UIState["isKeepScreen"]>
    ) => {
      state.isKeepScreen = action.payload;
    },
  },
});

export const UIStateReducer = UIStateSlice.reducer;
export const {
  setSelectedSideBar,
  setIsDarkMode,
  setIsImgEnabled,
  setImgData,
  setIsCollapsedSideBar,
  setIsKeepScreen,
} = UIStateSlice.actions;
