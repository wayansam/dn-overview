import { Drawer, FloatButton, Layout, theme } from "antd";
import { useMemo, useState } from "react";
import { TAB_LIST } from "../../constants/Common.constants";
import { useAppSelector } from "../../hooks";
import GeneralContent from "./GeneralContent";
import LunarJadeCalculatorContent from "./LunarJadeCalculatorContent";
import { QuestionCircleOutlined } from "@ant-design/icons";
import DrawerContent from "./DrawerContent";
import AncientEqContent from "./AncientEqContent";

const { Content } = Layout;

const MainContent = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [open, setOpen] = useState(false);

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );

  const content = useMemo(() => {
    switch (selectedSideBar) {
      case TAB_LIST[0].key:
        return <GeneralContent />;

      case TAB_LIST[1].key:
        return <LunarJadeCalculatorContent />;

      case TAB_LIST[2].key:
        return <AncientEqContent />;

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
      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="primary"
        style={{ right: 24 }}
        onClick={() => setOpen(true)}
      />
      <Drawer
        title="Help"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
      >
        <DrawerContent />
      </Drawer>
    </Content>
  );
};

export default MainContent;
