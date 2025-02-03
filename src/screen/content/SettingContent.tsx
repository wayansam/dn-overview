import { Card, Divider, List, Space, Switch, Typography } from "antd";
import { LS_KEYS } from "../../constants/localStorage.constants";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setIsDarkMode, setSelectedSideBar } from "../../slice/UIState.reducer";
import { SideBarTab } from "../../interface/Common.interface";
import { TAB_KEY } from "../../constants/Common.constants";
import { BaseType } from "antd/es/typography/Base";
import Link from "antd/es/typography/Link";

const SettingContent = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.UIState.isDarkMode);

  enum keyUpdate {
    N = 'New', U = 'Update', P = 'Planned', I = 'In Progress'
  }

  interface FeatureItem { label: string, key: keyUpdate, link?: SideBarTab }

  const dataNew: Array<FeatureItem> = [
    {
      'key': keyUpdate.N, label: 'Dimensional Dragon Jade', link: {
        key: TAB_KEY.jadeSkill,
        name: TAB_KEY.jadeSkill,
      },
    },
    { 'key': keyUpdate.U, label: 'Patch Note link for some existing item in Help bar (question mark in bottom right corner)' }
  ]
  const dataSoon: Array<FeatureItem> = [
    { 'key': keyUpdate.P, label: 'Ancient Lunar Jade Enhancement Calculator' },
    { 'key': keyUpdate.P, label: 'Conversion Costume Calculator' },
    { 'key': keyUpdate.P, label: 'Bone Dragon Armor & Weapon Calculator' },
  ]

  const getType = (item: FeatureItem): BaseType | undefined => {
    if (item.key === keyUpdate.N) {
      return 'success'
    }
    if (item.key === keyUpdate.U) {
      return 'warning'
    }
    if (item.key === keyUpdate.P) {
      return 'secondary'
    }
    if (item.key === keyUpdate.I) {
      return 'danger'
    }
    return
  }

  const renderItem = (item: FeatureItem) => (
    <List.Item>
      <Typography.Text type={getType(item)}>[{item.key}] </Typography.Text>
      {`${item.label} `}
      {item?.link && <Link onClick={() => {
        if (item?.link) {
          dispatch(setSelectedSideBar(item.link))
        }
      }} target="_blank">
        [Check Out]
      </Link>}
    </List.Item>
  )
  return (
    <div>
      <Card size="small" style={{ marginTop: 4 }}>
        <Divider orientation="left">Display Settings</Divider>
        <Space direction="horizontal">
          <Switch
            onChange={(e) => {
              localStorage.setItem(LS_KEYS.dark_mode, JSON.stringify(e));
              dispatch(setIsDarkMode(e));
            }}
            checked={isDarkMode}
          />
          Dark Mode
        </Space>

        <Divider orientation="left">What's New</Divider>
        <Space direction="horizontal">
          <List
            bordered
            dataSource={dataNew}
            renderItem={renderItem}
          />
        </Space>

        <Divider orientation="left">What's Next?</Divider>
        <Space direction="horizontal">
          <List
            bordered
            dataSource={dataSoon}
            renderItem={renderItem}
          />
        </Space>
      </Card>
    </div>
  );
};

export default SettingContent;
