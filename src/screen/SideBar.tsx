import {
  Button,
  Card,
  Divider,
  Grid,
  Layout,
  Modal,
  Space,
  theme,
} from "antd";
import { useMemo, useState } from "react";
import { TAB_GROUP_LIST } from "../constants/Common.constants";
import { LS_KEYS } from "../constants/localStorage.constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import { SideBarTab } from "../interface/Common.interface";
import {
  setIsCollapsedSideBar,
  setSelectedSideBar,
} from "../slice/UIState.reducer";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

const SideBar = () => {
  const dispatch = useAppDispatch();

  const { token } = theme.useToken();
  const screens = useBreakpoint();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar,
  );
  const isCollapsedSideBar = useAppSelector(
    (state) => state.UIState.isCollapsedSideBar,
  );
  const isKeepScreen = useAppSelector((state) => state.UIState.isKeepScreen);
  const hasUnsavedChanges = useAppSelector(
    (state) => state.UIState.hasUnsavedChanges,
  );

  const [modal, modalContextHolder] = Modal.useModal();
  const [isSmall, setIsSmall] = useState(false);

  const goToTab = (item: SideBarTab) => {
    dispatch(setSelectedSideBar(item));
    if (isKeepScreen) {
      localStorage.setItem(LS_KEYS.last_screen, JSON.stringify(item));
    }
  };

  const getWidthSetting = () => {
    if (screens.xs) {
      return 210;
    }
    return 250;
  };

  const iscollapsed = useMemo(() => {
    return isSmall ? isCollapsedSideBar : false;
  }, [isCollapsedSideBar, isSmall]);

  const setCollapse = (flag: boolean) => {
    if (isSmall) {
      dispatch(setIsCollapsedSideBar(flag));
    }
  };

  return (
    <Sider
      breakpoint="md"
      collapsedWidth="0"
      onBreakpoint={(broken) => {
        setIsSmall(broken);
      }}
      onCollapse={(collapsed, type) => {
        if (type === "clickTrigger" || type === "responsive") {
          dispatch(setIsCollapsedSideBar(collapsed));
        }
      }}
      collapsed={iscollapsed}
      style={
        isSmall
          ? {
              position: "fixed",
              zIndex: 100,
              height: "100%",
            }
          : undefined
      }
      width={getWidthSetting()}
      tabIndex={0}
      onBlur={() => setCollapse(true)}
      onFocus={() => setCollapse(false)}
    >
      {modalContextHolder}
      <div
        style={{
          height: "100%",
          overflowY: "auto",
        }}
      >
        <Space
          size={"small"}
          direction="vertical"
          style={{
            width: "100%",
            padding: "10px 15px 30px 0px",
            marginBottom: 30,
            borderWidth: 1,
            maxWidth: 200,
            borderBottomRightRadius: token.borderRadiusLG,
            backgroundColor: token.colorBgContainer,
          }}
        >
          {TAB_GROUP_LIST.map((group) => (
            <Card
              size="small"
              key={`card-${group.name}`}
              variant={"borderless"}
              style={{ paddingLeft: 0 }}
              styles={{ body: { paddingLeft: 0 } }}
            >
              <Divider style={{ margin: 0 }} orientation={"left"}>
                {group.name}
              </Divider>
              {group.children.map((item) => (
                <Button
                  key={`${group.name}-children-${item.key}`}
                  block
                  style={{
                    border: "none",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    justifyContent: "end",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "right",
                    minHeight: 32,
                    height: "auto",
                  }}
                  type={
                    selectedSideBar.key === item.key ? "primary" : "default"
                  }
                  onClick={() => {
                    if (
                      hasUnsavedChanges &&
                      selectedSideBar.key !== item.key
                    ) {
                      modal.confirm({
                        title: "Discard unsaved changes?",
                        content:
                          "Your character changes have not been saved yet.",
                        okText: "Discard",
                        okButtonProps: { danger: true },
                        cancelText: "Stay",
                        onOk: () => goToTab(item),
                      });
                      return;
                    }
                    goToTab(item);
                  }}
                  size={"middle"}
                >
                  <div style={{ margin: "2px 0px" }}>{item.name}</div>
                </Button>
              ))}
            </Card>
          ))}
        </Space>
      </div>
    </Sider>
  );
};

export default SideBar;
