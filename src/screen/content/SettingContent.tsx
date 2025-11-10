import { Button, Card, Divider, Form, Input, List, Space, Switch } from "antd";
import Link from "antd/es/typography/Link";
import { useEffect } from "react";
import { LS_KEYS } from "../../constants/localStorage.constants";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  setImgData,
  setIsDarkMode,
  setIsImgEnabled,
  setIsKeepScreen,
} from "../../slice/UIState.reducer";
import ReleaseNotes from "../../components/ReleaseNotes";
import { TAB_KEY } from "../../constants/Common.constants";

const SettingContent = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.UIState.isDarkMode);
  const isImgEnabled = useAppSelector((state) => state.UIState.isImgEnabled);
  const imgData = useAppSelector((state) => state.UIState.imgData);
  const isKeepScreen = useAppSelector((state) => state.UIState.isKeepScreen);

  const [form] = Form.useForm();

  // test https://media.tenor.com/_iNTPDlgTgEAAAAj/coffee-bara-capybara.gif
  useEffect(() => {
    form.setFieldsValue(imgData);
  }, [imgData]);

  const onFinish = (values: any) => {
    dispatch(setImgData(values));
    localStorage.setItem(LS_KEYS.img_data, JSON.stringify(values));
  };
  const onReset = () => {
    form.resetFields();
    dispatch(setImgData(null));
    localStorage.removeItem(LS_KEYS.img_data);
  };

  return (
    <div>
      <Card size="small" style={{ marginTop: 4 }}>
        <Divider orientation="left">Display Settings</Divider>
        <Space direction="vertical">
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
          <Space direction="horizontal">
            <Switch
              onChange={(e) => {
                localStorage.setItem(LS_KEYS.keep_screen, JSON.stringify(e));
                dispatch(setIsKeepScreen(e));
                if (e) {
                  localStorage.setItem(
                    LS_KEYS.last_screen,
                    JSON.stringify({
                      key: TAB_KEY.setting,
                      name: TAB_KEY.setting,
                    })
                  );
                }
              }}
              checked={isKeepScreen}
            />
            Stay on last opened screen on open / reload
          </Space>
          <Space direction="horizontal">
            <Switch
              onChange={(e) => {
                localStorage.setItem(LS_KEYS.img_enabled, JSON.stringify(e));
                dispatch(setIsImgEnabled(e));
              }}
              checked={isImgEnabled}
            />
            Use Custom Image
          </Space>
          <Card>
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              form={form}
              name="control-hooks"
              onFinish={onFinish}
              style={{ maxWidth: 600 }}
              disabled={!isImgEnabled}
              size={"small"}
            >
              <Form.Item
                name="url"
                label="URL"
                rules={[
                  { required: true },
                  { type: "url", warningOnly: true },
                  { type: "string", min: 6 },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="onTop" label="On Top" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item
                name="stickyWall"
                label="Stick to Wall"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                {...{
                  wrapperCol: { offset: 8, span: 16 },
                }}
              >
                <Space>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                  <Button htmlType="button" onClick={onReset}>
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Space>

        <ReleaseNotes />

        <Divider orientation="left">Have Something in Mind?</Divider>
        <Space direction="horizontal">
          <List bordered>
            <List.Item>
              <Link href="https://forms.gle/3nRYqHGPTyXugfKT8" target="_blank">
                DN Overview User Feedback form
              </Link>
            </List.Item>
          </List>
        </Space>
      </Card>
    </div>
  );
};

export default SettingContent;
