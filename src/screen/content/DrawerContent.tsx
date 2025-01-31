import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, CollapseProps, theme } from "antd";
import { CSSProperties } from "react";
import { TAB_KEY } from "../../constants/Common.constants";
import { useAppSelector } from "../../hooks";
import { equipmentCraftOpt } from "./LunarJadeCalculatorContent";

const getItems: (
  panelStyle: CSSProperties,
  key: string
) => CollapseProps["items"] = (panelStyle, key) => {
  const listHelp = [
    {
      key: TAB_KEY.eqAncient,
      label: TAB_KEY.eqAncient,
      children: (
        <div>
          <p>
            <b>
              For the mentioned weapon is Tier 2 Ancient Weapon, so you at least
              need to have +0 tier 2 ancient weapon first.
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
            equipment. &#40; 0 to 20 &#41;
          </p>
          <p>
            Calculated material only shown when you input the correct From, To
            and select the equipment.
          </p>
          <p>
            <i>
              You can always custom input everything in tab From, and To, but
              remember your custom input will be override by The Settings if you
              change it.
            </i>
          </p>
          <p>
            <i>
              Best way to do this is setup everything in common from settings,
              then adjust things you needed.
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
              The Max settings for armor is only available with tier 2 Ancient
              Armor where you can put additional attack jade in it.
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
              You can always custom input everything in tab Quantity, From, and
              To, but remember your custom input will be override by The
              Settings if you change it.
            </i>
          </p>
          <p>
            <i>
              Best way to do this is setup everything in common from settings,
              then adjust things you needed.
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
              After +10, all jade enhancement will have probability to fail,
              proceed with caution.
            </b>
          </p>
          <p>To use the calculator, please drag the pointer.</p>
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
            <b>This calculator only calculated Tier 1 Jade.</b>
          </p>
          <p>To use the calculator, please drag the pointer.</p>
          <p>
            <i>
              After Tier 2, all jade enhancement will have probability to fail,
              proceed with caution.
            </i>
          </p>
          <p>
            <i>
              Materials needed from +0 to +20 is the same, which is 10
              Concentrated Erosion Fragment, 300 Gold Lotus Crown and 5000 Gold.
            </i>
          </p>
        </div>
      ),
      style: panelStyle,
    },
    {
      key: TAB_KEY.eqNamedEOD,
      label: TAB_KEY.eqNamedEOD,
      children: (
        <div>
          <p>To use the calculator, please drag the pointer.</p>
          <p>
            <i>
              Materials needed to craft one weapon are 10 Guide Star, 80
              Twilight Essence and 25 Gold.
            </i>
          </p>
        </div>
      ),
      style: panelStyle,
    },
    {
      key: TAB_KEY.eqKilos,
      label: TAB_KEY.eqKilos,
      children: (
        <div>
          <p>
            <b>
              If you want to only calculate tier 2, please put Tier 1 +20 in
              'From' tab as Tier 2 +0 placeholder.
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
            equipment. &#40; 0 to 20 in each Tier&#41;
          </p>
          <p>
            Calculated material only shown when you input the correct From, To
            and select the equipment.
          </p>
          <p>
            Please check the 'Evo Tier 2' tab if you want to evolve Tier 1 Kilos
            to Tier 2. Check the 'Change Needle to Craft mats' in setting if you
            want to craft it.
          </p>
          <p>
            <i>
              You can always custom input everything in tab From, and To, but
              remember your custom input will be override by The Settings if you
              change it.
            </i>
          </p>
          <p>
            <i>
              Best way to do this is setup everything in common from settings,
              then adjust things you needed.
            </i>
          </p>
        </div>
      ),
      style: panelStyle,
    },
    {
      key: TAB_KEY.heraldryAncientGoddes,
      label: TAB_KEY.heraldryAncientGoddes,
      children: (
        <div>
          <p>
            <b>
              You don't need to buy the heraldry step by step from 1. You can
              directly buy the heraldry you want as long you have the required
              item.
            </b>
          </p>
          <p>
            To use the calculator, set the bottom point to your state right now
            and the top point to where you want to.
          </p>
          <p>
            You can always disassamble your heraldry but the gold cost for
            buying the blueprint item is not refunded.
          </p>
          <p>
            <i>
              Ancients' Blueprints can be bought from shop. It require 500 gold
              and 10 of Ancients' Blueprint Fragment
            </i>
          </p>
          <p>
            <i>You can access this shop via Heraldry NPC in Milla Laurel.</i>
          </p>
          <p>
            Patch Note related{" "}
            <a
              href="https://patchnote.dragonnest.com/sea/123/c/2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ancients' Goddess Heraldry
            </a>
          </p>
        </div>
      ),
      style: panelStyle,
    },
    {
      key: TAB_KEY.talismanBlackDragon,
      label: TAB_KEY.talismanBlackDragon,
      children: (
        <div>
          <p>
            <b>
              There are 6 Black Dragon's Talisman type but only 4 can be
              crafted.
            </b>
          </p>
          <p>
            To use the calculator, set the bottom point to your state right now
            and the top point to where you want to.
          </p>
          <p>You can trade this talisman (Reseal Count).</p>
          <p>
            <i>Most of the item is only drop from Black Dragon Nest.</i>
          </p>
          <p>
            Patch Note related{" "}
            <a
              href="https://patchnote.dragonnest.com/sea/108/c/3"
              target="_blank"
              rel="noopener noreferrer"
            >
              Black Dragon Talismans
            </a>
          </p>
        </div>
      ),
      style: panelStyle,
    },
    {
      key: TAB_KEY.talismanEternal,
      label: TAB_KEY.talismanEternal,
      children: (
        <div>
          <p>
            <b>
              There are 3 Eternal Talisman type but only 2 can be crafted (
              <i>Eternal World Talisman</i> & <i>Eternal Pain Talisman</i>).
            </b>
          </p>
          <p>
            For <i>Eternal Chaos Talisman</i>, can be acquired within the
            Dimensional Rift & have a total of 5 additional stats determined at
            random.
          </p>
          <p>
            To use the calculator, set the bottom point to your state right now
            and the top point to where you want to.
          </p>
          <p>
            You can trade this talisman (Reseal Count), normal storage & server
            storage.
          </p>
          <p>
            <i>Most of the item is only drop from Dimensional Rift.</i>
          </p>
          <p>
            Patch Note related{" "}
            <a
              href="https://patchnote.dragonnest.com/sea/129/c/3"
              target="_blank"
              rel="noopener noreferrer"
            >
              Eternal Talisman
            </a>
          </p>
        </div>
      ),
      style: panelStyle,
    },
  ];

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
  ];
};

const DrawerContent = () => {
  const { token } = theme.useToken();

  const selectedSideBar = useAppSelector(
    (state) => state.UIState.selectedSideBar
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
