import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Button, Layout, MenuProps, Space } from "antd";
import React from "react";
import { TAB_LIST } from "../constants/Common.constants";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSelectedSideBar } from "../slice/UIState.reducer";

const { Sider } = Layout;

const SideBar = () => {
  const dispatch = useAppDispatch();

  const items2: MenuProps["items"] = [
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    BarChartOutlined,
    CloudOutlined,
    AppstoreOutlined,
    TeamOutlined,
    ShopOutlined,
  ].map((icon, index) => ({
    key: `hehe ${String(index + 1)}`,
    icon: React.createElement(icon),
    label: `nav ${index + 1}`,
  }));

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );

  return (
    <Sider
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <Space
        direction="vertical"
        style={{ width: "100%", padding: "10px", borderWidth: 1 }}
      >
        {TAB_LIST.map((item, index) => (
          <Button
            block
            type={selectedSideBar === item.key ? "primary" : "default"}
            onClick={() => dispatch(setSelectedSideBar(item.key))}
          >
            {item.name}
          </Button>
        ))}
      </Space>
    </Sider>
  );
};

export default SideBar;
