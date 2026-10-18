import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Button, Checkbox, Space } from "antd";
import { OrderSetting } from "../utils/orderSetting.util";

interface OrderSettingListProps {
  items: { label: string; value: string }[];
  setting: OrderSetting;
  onChange: (setting: OrderSetting) => void;
  // Always-shown entries listed above / below the editable ones.
  fixedTop?: string[];
  fixedBottom?: string[];
}

// Checkboxes to show / hide items, with arrows to reorder them.
const OrderSettingList = ({
  items,
  setting,
  onChange,
  fixedTop = [],
  fixedBottom = [],
}: OrderSettingListProps) => {
  const toggle = (key: string, checked: boolean) =>
    onChange({
      ...setting,
      visible: checked
        ? [...setting.visible, key]
        : setting.visible.filter((item) => item !== key),
    });

  const move = (index: number, offset: -1 | 1) => {
    const order = [...setting.order];
    [order[index], order[index + offset]] = [
      order[index + offset],
      order[index],
    ];
    onChange({ ...setting, order });
  };

  const renderFixed = (labels: string[]) =>
    labels.map((label) => (
      <Checkbox key={label} checked disabled>
        {label}
      </Checkbox>
    ));

  return (
    <Space direction="vertical" size={4}>
      {renderFixed(fixedTop)}
      {setting.order.map((key, index) => (
        <Space
          key={key}
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <Checkbox
            checked={setting.visible.includes(key)}
            onChange={(e) => toggle(key, e.target.checked)}
          >
            {items.find((item) => item.value === key)?.label}
          </Checkbox>
          <Space size={0}>
            <Button
              size="small"
              type="text"
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              onClick={() => move(index, -1)}
            />
            <Button
              size="small"
              type="text"
              icon={<ArrowDownOutlined />}
              disabled={index === setting.order.length - 1}
              onClick={() => move(index, 1)}
            />
          </Space>
        </Space>
      ))}
      {renderFixed(fixedBottom)}
    </Space>
  );
};

export default OrderSettingList;
