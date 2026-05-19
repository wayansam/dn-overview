import { ConfigProvider, Layout, theme } from "antd";
import { useEffect } from "react";
import { LS_KEYS } from "../constants/localStorage.constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  setImgData,
  setIsDarkMode,
  setIsImgEnabled,
  setIsKeepScreen,
  setSelectedSideBar,
} from "../slice/UIState.reducer";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import FooterBar from "./FooterBar";
import MainContent from "./content/MainContent";
import { TAB_GROUP_LIST } from "../constants/Common.constants";

const { Content } = Layout;

const MainPage = () => {
  const dispatch = useAppDispatch();
  const { defaultAlgorithm, darkAlgorithm } = theme;

  const dm = localStorage.getItem(LS_KEYS.dark_mode);
  const imgEn = localStorage.getItem(LS_KEYS.img_enabled);
  const imgDt = localStorage.getItem(LS_KEYS.img_data);
  const imgDtJson = imgDt ? JSON.parse(imgDt) : null;
  const ks = localStorage.getItem(LS_KEYS.keep_screen);
  const ls = localStorage.getItem(LS_KEYS.last_screen);

  useEffect(() => {
    dispatch(setIsDarkMode(dm === "true"));
    dispatch(setIsImgEnabled(imgEn === "true"));
    dispatch(setImgData(imgDtJson));
    dispatch(setIsKeepScreen(ks === "true"));
    const dt = ls ? JSON.parse(ls) : TAB_GROUP_LIST[0].children[0];
    dispatch(setSelectedSideBar(dt));
  }, []);

  const isDarkMode = useAppSelector((state) => state.UIState.isDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <Layout hasSider style={{ height: "100vh" }}>
        <SideBar />
        <Layout>
          <TopBar />
          <Content style={{ padding: "24px 16px 0", overflow: "auto" }}>
            <MainContent />
          </Content>
          <FooterBar />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainPage;
