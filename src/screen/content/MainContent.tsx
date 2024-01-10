import { Drawer, FloatButton, theme } from "antd";
import { useMemo, useState } from "react";
import { TAB_KEY } from "../../constants/Common.constants";
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
    switch (selectedSideBar.key) {
      case TAB_KEY.mainGeneral:
        return <GeneralContent />;

      case TAB_KEY.eqAncient:
        return <AncientEqContent />;

      case TAB_KEY.jadeLunar:
        return <LunarJadeCalculatorContent />;

      case TAB_KEY.jadeSkill:
        return <SkillJadeContent />;

      case TAB_KEY.jadeErosion:
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
