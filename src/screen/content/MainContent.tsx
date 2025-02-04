import { QuestionCircleOutlined } from "@ant-design/icons";
import { Col, Drawer, FloatButton, Grid, Row, Space, theme, Image } from "antd";
import { useMemo, useState } from "react";
import { TAB_KEY } from "../../constants/Common.constants";
import { useAppSelector } from "../../hooks";
import AncientEqContent from "./AncientEqContent";
import AncientHeraldryContent from "./AncientHeraldryContent";
import BlackDragonTalismanContent from "./BlackDragonTalismanContent";
import DrawerContent from "./DrawerContent";
import ErosionJadeContent from "./ErosionJadeContent";
import ExternalTalismanContent from "./EternalTalismanContent";
import GeneralContent from "./GeneralContent";
import KilosEqContent from "./KilosEqContent";
import LunarJadeCalculatorContent from "./LunarJadeCalculatorContent";
import NamedEODEqContent from "./NamedEODEqContent";
import SettingContent from "./SettingContent";
import SkillJadeContent from "./SkillJadeContent";

const { useBreakpoint } = Grid;


const MainContent = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );
  const isImgEnabled = useAppSelector((state) => state.UIState.isImgEnabled);
  const imgData = useAppSelector((state) => state.UIState.imgData);

  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  console.log({ screens });
  const isShowingImg = !!(isImgEnabled && imgData)

  const content = useMemo(() => {
    switch (selectedSideBar.key) {
      case TAB_KEY.mainGeneral:
        return <GeneralContent />;

      case TAB_KEY.eqAncient:
        return <AncientEqContent />;

      case TAB_KEY.eqKilos:
        return <KilosEqContent />;

      case TAB_KEY.eqNamedEOD:
        return <NamedEODEqContent />;

      case TAB_KEY.jadeLunar:
        return <LunarJadeCalculatorContent />;

      case TAB_KEY.jadeSkill:
        return <SkillJadeContent />;

      case TAB_KEY.jadeErosion:
        return <ErosionJadeContent />;

      case TAB_KEY.heraldryAncientGoddes:
        return <AncientHeraldryContent />;

      case TAB_KEY.talismanBlackDragon:
        return <BlackDragonTalismanContent />;

      case TAB_KEY.talismanEternal:
        return <ExternalTalismanContent />;

      case TAB_KEY.setting:
        return <SettingContent />;

      default:
        return;
    }
  }, [selectedSideBar]);

  const imgComponent = imgData ? (<div style={
    {
      marginLeft: 8,
      display: 'flex',
      justifyContent: 'flex-end',
      marginRight: -16
    }
  }>
    <Image
      // width={200}
      src={imgData.url}
      style={{ maxWidth: '100%', height: 'auto' }}
      preview={false}
    />
  </div>) : <div></div>

  return (
    <>
      {screens.xs && isShowingImg && imgData?.onTop && imgComponent}
      <Row>
        <Col span={!screens.xs && isShowingImg ? 18 : 24}>
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
        </Col>
        <Col span={!screens.xs && isShowingImg ? 6 : 0}>
          {imgComponent}
        </Col>
      </Row>
      {screens.xs && isShowingImg && !imgData?.onTop && imgComponent}
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
