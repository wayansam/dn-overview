import {
  ExperimentTwoTone,
  LoadingOutlined,
  QuestionCircleOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import {
  Col,
  Drawer,
  FloatButton,
  Grid,
  Image,
  notification,
  Row,
  theme,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
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
import ConversionContent from "./ConversionContent";
import BoneDragonEqContent from "./BoneDragonEqContent";
import BestieContent from "./BestieContent";
import VIPAccContent from "./VIPAccContent";
import SpunGoldEqContent from "./SpunGoldEqContent";
import CollapseJadeContent from "./CollapseJadeContent";
import StageAoTContent from "./StageAoTContent";

const { useBreakpoint } = Grid;
const { Text } = Typography;

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const MainContent = () => {
  const {
    token: { colorBgContainer, colorText },
  } = theme.useToken();
  const [api, contextHolder] = notification.useNotification();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );
  const isImgEnabled = useAppSelector((state) => state.UIState.isImgEnabled);
  const imgData = useAppSelector((state) => state.UIState.imgData);

  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const isShowingImg = !!(isImgEnabled && imgData);

  const openNotification = () => {
    api.open({
      message: "Don't miss out",
      description: "Reload this page once in a while to get it latest content.",
      icon: <SmileOutlined style={{ color: "#108ee9" }} />,
    });
  };

  useEffect(() => {
    if (typeof window?.gtag === "function") {
      window?.gtag("event", "screen_view", {
        app_name: "dn-overview",
        screen_name: selectedSideBar.key,
        page_path: "/dn-overview",
        page_title: selectedSideBar.key,
      });
    }
  }, [selectedSideBar]);

  const content = useMemo(() => {
    switch (selectedSideBar.key) {
      case TAB_KEY.mainGeneral:
        return <GeneralContent />;

      case TAB_KEY.stageArcOfTranscen:
        return <StageAoTContent />;

      case TAB_KEY.eqAncient:
        return <AncientEqContent />;

      case TAB_KEY.eqKilos:
        return <KilosEqContent />;

      case TAB_KEY.eqNamedEOD:
        return <NamedEODEqContent />;

      case TAB_KEY.eqBoneDragon:
        return <BoneDragonEqContent />;

      case TAB_KEY.eqVIPAcc:
        return <VIPAccContent />;

      case TAB_KEY.eqSpunGold:
        return <SpunGoldEqContent />;

      case TAB_KEY.jadeLunar:
        return <LunarJadeCalculatorContent />;

      case TAB_KEY.jadeSkill:
        return <SkillJadeContent />;

      case TAB_KEY.jadeErosion:
        return <ErosionJadeContent />;

      case TAB_KEY.jadeCollapse:
        return <CollapseJadeContent />;

      case TAB_KEY.heraldryAncientGoddes:
        return <AncientHeraldryContent />;

      case TAB_KEY.talismanBlackDragon:
        return <BlackDragonTalismanContent />;

      case TAB_KEY.talismanEternal:
        return <ExternalTalismanContent />;

      case TAB_KEY.miscConversion:
        return <ConversionContent />;

      case TAB_KEY.miscBestie:
        return <BestieContent />;

      case TAB_KEY.setting:
        return <SettingContent />;

      default:
        return (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: `rgba(200,200,200,0.3)`,
                padding: 40,
                borderRadius: 28,
                justifyItems: "center",
              }}
            >
              <div>
                <ExperimentTwoTone style={{ fontSize: 28, padding: 7 }} />
                <LoadingOutlined
                  style={{
                    fontSize: 42,
                    color: "white",
                    position: "fixed",
                    marginLeft: -42,
                  }}
                />
              </div>
              <div>
                <Text>Crafting...</Text>
              </div>
            </div>
          </div>
        );
    }
  }, [selectedSideBar]);

  const imgComponent = imgData ? (
    <div
      style={{
        marginLeft: 8,
        display: "flex",
        justifyContent: "flex-end",
        marginRight: imgData.stickyWall ? -16 : 0,
      }}
    >
      <Image
        // width={200}
        src={imgData.url}
        style={{ maxWidth: "100%", height: "auto" }}
        preview={false}
      />
    </div>
  ) : (
    <div></div>
  );

  useEffect(() => {
    openNotification();
  }, []);

  return (
    <>
      {contextHolder}
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
        <Col span={!screens.xs && isShowingImg ? 6 : 0}>{imgComponent}</Col>
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
