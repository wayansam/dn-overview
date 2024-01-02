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

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );

  return (
    <Sider
      breakpoint="md"
      collapsedWidth="0"
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
