import { Button, Divider, Layout, Space, theme } from "antd";
import { useState } from "react";
import { TAB_GROUP_LIST } from "../constants/Common.constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSelectedSideBar } from "../slice/UIState.reducer";

const { Sider } = Layout;

const SideBar = () => {
  const dispatch = useAppDispatch();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );

  const [isSmall, setIsSmall] = useState(false);

  return (
    <Sider
      breakpoint="md"
      collapsedWidth="0"
      onBreakpoint={(broken) => {
        setIsSmall(broken);
      }}
      onCollapse={(collapsed, type) => {
        // console.log({ collapsed, type });
      }}
      style={
        isSmall
          ? {
              position: "fixed",
              zIndex: 100,
              height: "100%",
            }
          : undefined
      }
    >
      <div
        style={{
          height: "100%",
          overflowY: "auto",
        }}
      >
        <Space
          direction="vertical"
          style={{
            width: "100%",
            padding: "10px",
            borderWidth: 1,
          }}
        >
          {TAB_GROUP_LIST.map((group) => (
            <>
              <Divider
                style={{ color: "white", margin: 0, borderBlockStart: "white" }}
                orientation={"left"}
              >
                {group.name}
              </Divider>
              {group.children.map((item) => (
                <Button
                  block
                  type={
                    selectedSideBar.key === item.key ? "primary" : "default"
                  }
                  onClick={() => dispatch(setSelectedSideBar(item))}
                >
                  {item.name}
                </Button>
              ))}
            </>
          ))}
        </Space>
      </div>
    </Sider>
  );
};

export default SideBar;
