import { AppstoreOutlined } from "@ant-design/icons";
import { Button, Col, Empty, Popover, Row, Space } from "antd";
import { useState } from "react";
import OrderSettingList from "../../../components/OrderSettingList";
import { WIDGET_KEYS, WIDGETS } from "../../../components/widgets";
import { LS_KEYS } from "../../../constants/localStorage.constants";
import {
  OrderSetting,
  loadOrderSetting,
  saveOrderSetting,
} from "../../../utils/orderSetting.util";

const widgetOptions = WIDGETS.map((item) => ({
  label: item.label,
  value: item.key,
}));

// Dashboard of widgets the user picks and orders with Customize.
const GeneralContent = () => {
  const [setting, setSetting] = useState<OrderSetting>(() =>
    loadOrderSetting(LS_KEYS.general_widgets, WIDGET_KEYS),
  );

  const changeSetting = (value: OrderSetting) => {
    setSetting(value);
    saveOrderSetting(LS_KEYS.general_widgets, value);
  };

  const shownWidgets = setting.order
    .filter((key) => setting.visible.includes(key))
    .map((key) => WIDGETS.find((item) => item.key === key)!);

  return (
    <div>
      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Popover
          title="Widgets"
          trigger="click"
          placement="bottomRight"
          content={
            <OrderSettingList
              items={widgetOptions}
              setting={setting}
              onChange={changeSetting}
            />
          }
        >
          <Button icon={<AppstoreOutlined />}>Customize</Button>
        </Popover>
      </Space>
      {shownWidgets.length ? (
        <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
          {shownWidgets.map((item) => (
            <Col key={item.key} xs={24} xl={12}>
              {item.render()}
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          style={{ marginTop: 24 }}
          description="No widget shown, use Customize to add some"
        />
      )}
    </div>
  );
};

export default GeneralContent;
