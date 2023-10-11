import { Collapse, CollapseProps, Divider, theme } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { CSSProperties } from "react";
import { equipmentCraftOpt } from "./LunarJadeCalculatorContent";

const getItems: (panelStyle: CSSProperties) => CollapseProps["items"] = (
  panelStyle
) => [
  {
    key: "1",
    label: "General",
    children: <p>You can find each page functionality description here</p>,
    style: panelStyle,
  },
  {
    key: "2",
    label: "Lunar Jade Calculator",
    children: (
      <div>
        <p>
          To use the calculator, please select the equipment you want to
          calculate.
        </p>
        <p>
          You can always open Craft Reference if you are not sure about the
          number.
        </p>
        <p>
          Please add the quantity so it can calculate precisely based on your
          need.
        </p>
        <p>
          Select the From &#38; To option in correct progression of the
          equipment. &#40;
          {equipmentCraftOpt.map((item) => item.label).join(" > ")} &#41;
        </p>
        <p>
          Calculated material only shown when you input the correct amount,
          From, To and select the equipment.
        </p>
      </div>
    ),
    style: panelStyle,
  },
  {
    key: "3",
    label: "About Us",
    children: (
      <p>
        This app is managed by me and only on free time, so please kindly wait
        for the further update :&#41;
      </p>
    ),
    style: panelStyle,
  },
];

const DrawerContent = () => {
  const { token } = theme.useToken();

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  return (
    <div>
      <Collapse
        bordered={false}
        defaultActiveKey={["1"]}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        style={{ background: token.colorBgContainer }}
        items={getItems(panelStyle)}
      />
    </div>
  );
};

export default DrawerContent;
