import { Layout, theme } from "antd";
import { useMemo } from "react";
import { TAB_LIST } from "../../constants/Common.constants";
import { useAppSelector } from "../../hooks";
import GeneralContent from "./GeneralContent";
import LunarJadeCalculatorContent from "./LunarJadeCalculatorContent";

const { Content } = Layout;

const MainContent = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );

  const content = useMemo(() => {
    switch (selectedSideBar) {
      case TAB_LIST[0].key:
        return <GeneralContent />;

      case TAB_LIST[1].key:
        return <LunarJadeCalculatorContent />;

      default:
        return;
    }
  }, [selectedSideBar]);

  return (
    <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
      <div
        style={{
          padding: 24,
          background: colorBgContainer,
        }}
      >
        {content}
      </div>
    </Content>
  );
};

export default MainContent;
