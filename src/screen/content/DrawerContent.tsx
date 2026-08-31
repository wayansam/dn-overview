import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, CollapseProps, theme } from "antd";
import { CSSProperties } from "react";
import { TAB_KEY } from "../../constants/Common.constants";
import { useAppSelector } from "../../hooks";
import { equipmentHelpItems } from "./drawerHelp/equipmentHelp";
import { heraldryHelpItems } from "./drawerHelp/heraldryHelp";
import { jadeHelpItems } from "./drawerHelp/jadeHelp";
import { miscHelpItems } from "./drawerHelp/miscHelp";
import { stageHelpItems } from "./drawerHelp/stageHelp";
import { talismanHelpItems } from "./drawerHelp/talismanHelp";

// Each tab group's help text lives in its own file under drawerHelp/,
// mirroring the equipment/jade/heraldry/talisman/misc/stage split already
// used for data/ and screen/content/ — keeps this file from growing into a
// single giant JSX array again as new tabs get added.
const listHelp = [
  ...stageHelpItems,
  ...equipmentHelpItems,
  ...jadeHelpItems,
  ...heraldryHelpItems,
  ...talismanHelpItems,
  ...miscHelpItems,
];

const getItems: (
  panelStyle: CSSProperties,
  key: string,
) => CollapseProps["items"] = (panelStyle, key) => {
  return [
    {
      key: TAB_KEY.mainGeneral,
      label: TAB_KEY.mainGeneral,
      children: <p>You can find each page functionality description here</p>,
      style: panelStyle,
    },
    ...listHelp
      .filter((item) => item.key === key)
      .map((item) => ({ ...item, style: panelStyle })),
    {
      key: "Last",
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
};

const DrawerContent = () => {
  const { token } = theme.useToken();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar,
  );

  const panelStyle: React.CSSProperties = {
    marginRight: 8,
    marginLeft: 8,
    margin: 12,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
  };

  return (
    <div>
      <Collapse
        bordered={false}
        activeKey={[TAB_KEY.mainGeneral, selectedSideBar.key, "Last"]}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        style={{
          paddingTop: 4,
          paddingBottom: 4,
        }}
        items={getItems(panelStyle, selectedSideBar.key)}
      />
    </div>
  );
};

export default DrawerContent;
