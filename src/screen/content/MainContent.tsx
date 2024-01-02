import { Drawer, FloatButton, theme } from "antd";
import { useMemo, useState } from "react";
import { TAB_LIST } from "../../constants/Common.constants";
import { useAppSelector } from "../../hooks";
import GeneralContent from "./GeneralContent";
import LunarJadeCalculatorContent from "./LunarJadeCalculatorContent";
import { QuestionCircleOutlined } from "@ant-design/icons";
import DrawerContent from "./DrawerContent";
import AncientEqContent from "./AncientEqContent";
import SkillJadeContent from "./SkillJadeContent";
import ErosionJadeContent from "./ErosionJadeContent";

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

      case TAB_LIST[3].key:
        return <SkillJadeContent />;

      case TAB_LIST[4].key:
        return <ErosionJadeContent />;

      default:
        return;
    }
  }, [selectedSideBar]);

  return (
    <>
      <div
        style={{
          padding: 24,
          background: colorBgContainer,
          borderRadius: 24,
          boxShadow: "10px 10px 10px 0px rgba(0,0,0,0.1)",
          marginBottom: 20,
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
    </>
  );
};

export default MainContent;
