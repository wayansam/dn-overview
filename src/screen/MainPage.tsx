import { ConfigProvider, Layout, theme } from "antd";
import Title from "antd/es/typography/Title";
import { useState } from "react";
import { useAppSelector } from "../hooks";
import SideBar from "./SideBar";
import MainContent from "./content/MainContent";

const { Header, Content, Footer } = Layout;

const MainPage = () => {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const [isDarkMode, setIsDarkMode] = useState(true);

  const {
    token: { colorBgContainer, colorText },
  } = theme.useToken();
  const { token } = theme.useToken();
  // console.log({ isDarkMode, token });

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <Layout hasSider style={{ height: "100vh" }}>
        <SideBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
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
