import { ConfigProvider, Layout, theme } from "antd";
import Title from "antd/es/typography/Title";
import { useEffect } from "react";
import { LS_KEYS } from "../constants/localStorage.constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setImgData, setIsDarkMode, setIsImgEnabled } from "../slice/UIState.reducer";
import SideBar from "./SideBar";
import MainContent from "./content/MainContent";

const { Header, Content, Footer } = Layout;

const MainPage = () => {
  const dispatch = useAppDispatch();
  const { defaultAlgorithm, darkAlgorithm } = theme;

  const dm = localStorage.getItem(LS_KEYS.dark_mode);
  const imgEn = localStorage.getItem(LS_KEYS.img_enabled);
  const imgDt = localStorage.getItem(LS_KEYS.img_data);
  const imgDtJson = imgDt ? JSON.parse(imgDt) : null;


  useEffect(() => {
    dispatch(setIsDarkMode(dm === "true"));
    dispatch(setIsImgEnabled(imgEn === "true"));
    dispatch(setImgData(imgDtJson));
  }, []);

  const {
    token: { colorBgContainer, colorText },
  } = theme.useToken();
  const { token } = theme.useToken();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );
  const isDarkMode = useAppSelector((state) => state.UIState.isDarkMode);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <Layout
        hasSider
        style={{
          height: "100vh",
          scrollbarColor: isDarkMode
            ? `rgba(200,200,200,0.3) ${colorText}`
            : `rgba(200,200,200,0.9) ${colorBgContainer}`,
        }}
      >
        <SideBar />
        <Layout>
          <Header
            style={{
              padding: 0,
              background: isDarkMode ? colorText : colorBgContainer,
              paddingLeft: 20,
              boxShadow: "5px 5px 5px 0px rgba(200,200,200,0.1)",
              zIndex: 2,
            }}
          >
            <Title level={3}>{selectedSideBar.name}</Title>
          </Header>
          <Content style={{ padding: "24px 16px 0", overflow: "auto" }}>
            <MainContent />
          </Content>
          <Footer
            style={{
              textAlign: "center",
              boxShadow: "5px -5px 5px 0px rgba(200,200,200,0.1)",
              padding: "6px 50px",
              zIndex: 2,
            }}
          >
            dn overview ©2023 Created by sam
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainPage;
