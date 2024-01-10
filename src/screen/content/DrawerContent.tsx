import { Collapse, CollapseProps, Divider, theme } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { CSSProperties, useMemo } from "react";
import { equipmentCraftOpt } from "./LunarJadeCalculatorContent";
import { TAB_KEY } from "../../constants/Common.constants";
import { useAppSelector } from "../../hooks";

const getItems: (panelStyle: CSSProperties, key: string) => CollapseProps["items"] = (
  panelStyle, key
) => {
  const listHelp = [
    {
      key: TAB_KEY.eqAncient,
      label: TAB_KEY.eqAncient,
      children: (
        <div>
          <p>
            <b>
              For the mentioned weapon is Tier 2 Ancient Weapon, so you at least need to have +0 tier 2 ancient weapon first.
            </b>
          </p>
          <p>
            To use the calculator, please select the equipment you want to
            calculate.
          </p>
          <p>
            You can always open Craft Reference if you are not sure about the
            number.
          </p>
          <p>
            Select the From &#38; To option in correct progression of the
            equipment. &#40;
            0 to 20 &#41;
          </p>
          <p>
            Calculated material only shown when you input the correct
            From, To and select the equipment.
          </p>
          <p>
            <i>
              You can always custom input everything in tab From, and To, but remember your custom input will be override by The Settings if you change it.
            </i>
          </p>
          <p>
            <i>
              Best way to do this is setup everything in common from settings, then adjust things you needed.
            </i>
          </p>
        </div>
      ),
      style: panelStyle,
    },
    {
      key: TAB_KEY.jadeLunar,
      label: TAB_KEY.jadeLunar,
      children: (
        <div>
          <p>
            <b>
              The Max settings for armor is only available with tier 2 Ancient Armor where you can put additional attack jade in it.
            </b>
          </p>
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
          <p>
            <i>
              You can always custom input everything in tab Quantity, From, and To, but remember your custom input will be override by The Settings if you change it.
            </i>
          </p>
          <p>
            <i>
              Best way to do this is setup everything in common from settings, then adjust things you needed.
            </i>
          </p>
        </div>
      ),
      style: panelStyle,
    },
    {
      key: TAB_KEY.jadeSkill,
      label: TAB_KEY.jadeSkill,
      children: (
        <div>
          <p>
            <b>
              After +10, all jade enhancement will have probability to fail, proceed with caution.
            </b>
          </p>
          <p>
            To use the calculator, please drag the pointer.
          </p>
        </div>
      ),
      style: panelStyle,
    },
    {
      key: TAB_KEY.jadeErosion,
      label: TAB_KEY.jadeErosion,
      children: (
        <div>
          <p>
            <b>
              This calculator only calculated Tier 1 Jade.
            </b>
          </p>
          <p>
            To use the calculator, please drag the pointer.
          </p>
          <p>
            <i>
              After Tier 2, all jade enhancement will have probability to fail, proceed with caution.
            </i>
          </p>
          <p>
            <i>
              Materials needed from +0 to +20 is the same, which is 10 Concentrated Erosion Fragment, 300 Gold Lotus Crown and 5000 Gold.
            </i>
          </p>
        </div>
      ),
      style: panelStyle,
    }

  ]

  return [
    {
      key: TAB_KEY.mainGeneral,
      label: TAB_KEY.mainGeneral,
      children: <p>You can find each page functionality description here</p>,
      style: panelStyle,
    },
    ...listHelp.filter((item) => item.key === key),
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
  ]
};

const DrawerContent = () => {
  const { token } = theme.useToken();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
  );

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
        activeKey={[TAB_KEY.mainGeneral, selectedSideBar.key, 'Last']}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        style={{ background: token.colorBgContainer }}
        items={getItems(panelStyle, selectedSideBar.key)}
      />
    </div>
  );
};

export default DrawerContent;
