import { Layout, theme } from "antd";
import Title from "antd/es/typography/Title";
import { TAB_LIST } from "../constants/Common.constants";
import { useAppSelector } from "../hooks";
import SideBar from "./SideBar";
import MainContent from "./content/MainContent";

const { Header, Content, Footer } = Layout;

const MainPage = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );

  const headerText = TAB_LIST.find((item) => item.key === selectedSideBar);

  return (
    <Layout hasSider>
      <SideBar />
      <Layout className="site-layout" style={{ marginLeft: 200 }}>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            paddingLeft: 20,
            boxShadow: "5px 5px 5px 0px rgba(200,200,200,0.1)",
          }}
        >
          <Title level={3}>{headerText?.name}</Title>
        </Header>
        <MainContent />
        <Footer style={{ textAlign: "center" }}>
          dn overview ©2023 Created by sam
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainPage;
