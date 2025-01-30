import { Card, Divider, Space, Switch, Typography } from "antd";
import { LS_KEYS } from "../../constants/localStorage.constants";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setIsDarkMode } from "../../slice/UIState.reducer";
const { Text } = Typography;

const SettingContent = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.UIState.isDarkMode);
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
      </Card>
    </div>
  );
};

export default SettingContent;
