import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  List,
  Space,
  Switch,
  Typography,
} from "antd";
import { BaseType } from "antd/es/typography/Base";
import Link from "antd/es/typography/Link";
import { useEffect } from "react";
import { TAB_KEY } from "../../constants/Common.constants";
import { LS_KEYS } from "../../constants/localStorage.constants";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { SideBarTab } from "../../interface/Common.interface";
import {
  setImgData,
  setIsDarkMode,
  setIsImgEnabled,
  setSelectedSideBar,
} from "../../slice/UIState.reducer";

const SettingContent = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.UIState.isDarkMode);
  const isImgEnabled = useAppSelector((state) => state.UIState.isImgEnabled);
  const imgData = useAppSelector((state) => state.UIState.imgData);

  const [form] = Form.useForm();

  enum keyUpdate {
    N = "New",
    U = "Update",
    P = "Planned",
    I = "In Progress",
  }

  interface FeatureItem {
    label: string;
    key: keyUpdate;
    link?: SideBarTab;
    date?: string;
  }

  const dataNew: Array<FeatureItem> = [
    {
      key: keyUpdate.N,
      label: "Dimensional Dragon Jade",
      link: {
        key: TAB_KEY.jadeSkill,
        name: TAB_KEY.jadeSkill,
      },
      date: "03-02-2025",
    },
    {
      key: keyUpdate.U,
      label:
        "Patch Note link for some existing item in Help bar (question mark in bottom right corner)",
    },
    {
      key: keyUpdate.N,
      label: "Ancient Lunar Jade Enhancement Calculator",
      link: {
        key: TAB_KEY.jadeLunar,
        name: TAB_KEY.jadeLunar,
        payload: {
          lunarScreen: {
            tabOpen: ["4"],
          },
        },
      },
      date: "23-02-2025",
    },
  ];
  const dataSoon: Array<FeatureItem> = [
    { key: keyUpdate.P, label: "Conversion Costume Calculator" },
    { key: keyUpdate.P, label: "Bone Dragon Armor & Weapon Calculator" },
  ];

  const getType = (item: FeatureItem): BaseType | undefined => {
    if (item.key === keyUpdate.N) {
      return "success";
    }
    if (item.key === keyUpdate.U) {
      return "warning";
    }
    if (item.key === keyUpdate.P) {
      return "secondary";
    }
    if (item.key === keyUpdate.I) {
      return "danger";
    }
    return;
  };

  const renderItem = (item: FeatureItem) => (
    <List.Item>
      <Typography.Text type={getType(item)}>[{item.key}] </Typography.Text>
      {`${item.label} `}
      {item?.link && (
        <Link
          onClick={() => {
            if (item?.link) {
              dispatch(setSelectedSideBar(item.link));
            }
          }}
          target="_blank"
        >
          [Check Out]
        </Link>
      )}
      {item?.date && <Typography.Text> [{item.date}] </Typography.Text>}
    </List.Item>
  );

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

        <Divider orientation="left">What's New</Divider>
        <Space direction="horizontal">
          <List bordered dataSource={dataNew} renderItem={renderItem} />
        </Space>

        <Divider orientation="left">What's Next?</Divider>
        <Space direction="horizontal">
          <List bordered dataSource={dataSoon} renderItem={renderItem} />
        </Space>
      </Card>
    </div>
  );
};

export default SettingContent;
