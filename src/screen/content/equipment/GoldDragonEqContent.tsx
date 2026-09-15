import { Typography } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CraftMaterialField } from "../../../components/CraftMaterialColumns";
import EquipmentCalculatorPanel from "../../../components/EquipmentCalculatorPanel";
import { ItemList } from "../../../components/ListingCard";
import MatsReferenceTables from "../../../components/MatsReferenceTables";
import StatReferenceTables from "../../../components/StatReferenceTables";
import { TAB_KEY } from "../../../constants/Common.constants";
import { EQUIPMENT } from "../../../constants/InGame.constants";
import {
  GoldDragonEqEnhanceMaterialArmorTable,
  GoldDragonEqEnhanceMaterialWeapTable,
  GoldDragonStatsGlovesTable,
  GoldDragonStatsHelmTable,
  GoldDragonStatsLowerTable,
  GoldDragonStatsMainTable,
  GoldDragonStatsSecondTable,
  GoldDragonStatsShoesTable,
  GoldDragonStatsUpperTable,
  dataGoldCalculator,
} from "../../../data/equipment/GoldDragonEqData";
import {
  useEquipmentAccumulator,
  useEquipmentStatDiff,
  useInvalidRange,
  useSelectionFlag,
} from "../../../hooks/useEquipmentCalculator";
import { BoneCalculator } from "../../../interface/Common.interface";
import { GoldDragonEqEnhanceMaterial } from "../../../interface/Item.interface";
import {
  getBreakTag,
  getDeductTag,
  getSuccessRateTag,
} from "../../../utils/common.util";
import { buildRateSummary } from "../../../utils/rateSummary";
import { getResource } from "../../../utils/resource.util";

const { Text } = Typography;

type SelectedStats = Exclude<
  EQUIPMENT,
  EQUIPMENT.NECKLACE | EQUIPMENT.EARRING | EQUIPMENT.RING1 | EQUIPMENT.RING2
>;
type EquipmentExtraData = {
  [key in SelectedStats]?: {
    "Success Rate": Array<number | undefined>;
    "Break Rate": Array<number | undefined>;
    "Fail Deduction": Array<number | undefined>;
  };
};
interface ExtraData extends EquipmentExtraData {
  Jelly: number;
}
interface TableMaterialList {
  "Scale Powder": number;
  "Plate Powder": number;
  "Jewel Fragment": number;
  Gold: number;
}

const matsFields: CraftMaterialField<GoldDragonEqEnhanceMaterial>[] = [
  { dataIndex: "scalePowder", label: "Scale Powder", shortLabel: "(Scale Powder)" },
  { dataIndex: "platePowder", label: "Plate Powder", shortLabel: "(Plate Powder)" },
  { dataIndex: "jewelFragment", label: "Jewel Fragment", shortLabel: "(Jewel Fragment)" },
  { dataIndex: "gold", label: "Gold", shortLabel: "(g)" },
  { dataIndex: "jelly", label: "Jelly", shortLabel: "(Jelly)" },
  {
    dataIndex: "successRatePercent",
    label: "Success Rate",
    shortLabel: "(Success%)",
    tailText: "%",
  },
  {
    dataIndex: "breakNoJellyPercent",
    label: "Break Rate",
    shortLabel: "(Break%)",
    tailText: "%",
  },
  {
    dataIndex: "enhanceFailDeduction",
    label: "Fail Deduction",
    shortLabel: "(Deduct)",
  },
];

const GoldDragonEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<BoneCalculator[]>(dataGoldCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);

  const invalidDtSrc = useInvalidRange(selectedRowKeys, dataSource);
  const riskDtSrc = useSelectionFlag(selectedRowKeys, dataSource, (row) => row.to > 3);

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const emptyGoldDragonMats: { res1: TableMaterialList; res2: ExtraData } = {
    res1: { "Scale Powder": 0, "Plate Powder": 0, "Jewel Fragment": 0, Gold: 0 },
    res2: { Jelly: 0 },
  };

  const getGoldDragonMatsTable = useCallback(
    (equipment: EQUIPMENT): GoldDragonEqEnhanceMaterial[] => {
      switch (equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          return GoldDragonEqEnhanceMaterialArmorTable;

        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          return GoldDragonEqEnhanceMaterialWeapTable;

        default:
          return [];
      }
    },
    []
  );

  const reduceGoldDragonRow = useCallback(
    (
      acc: { res1: TableMaterialList; res2: ExtraData },
      slice: GoldDragonEqEnhanceMaterial[],
      row: BoneCalculator
    ): { res1: TableMaterialList; res2: ExtraData } => {
      const res1 = { ...acc.res1 };
      const res2 = { ...acc.res2 };

      let scalePowderTemp = 0;
      let platePowderTemp = 0;
      let jewelFragmentTemp = 0;
      let goldTemp = 0;
      let jellyTemp = 0;
      let srTemp: number[] = [];
      let brTemp: number[] = [];
      let deTemp: Array<number | undefined> = [];

      slice.forEach((slicedItem) => {
        scalePowderTemp += slicedItem.scalePowder;
        platePowderTemp += slicedItem.platePowder;
        jewelFragmentTemp += slicedItem.jewelFragment;
        goldTemp += slicedItem.gold;
        jellyTemp += slicedItem.jelly ?? 0;
        srTemp.push(slicedItem.successRatePercent);
        brTemp.push(slicedItem.breakNoJellyPercent);
        deTemp.push(slicedItem.enhanceFailDeduction);
      });

      res1["Scale Powder"] += scalePowderTemp;
      res1["Plate Powder"] += platePowderTemp;
      res1["Jewel Fragment"] += jewelFragmentTemp;
      res1.Gold += goldTemp;
      res2.Jelly += jellyTemp;

      const exData = {
        "Success Rate": srTemp,
        "Break Rate": brTemp,
        "Fail Deduction": deTemp,
      };
      switch (row.equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          res2[row.equipment] = exData;
          break;

        default:
          break;
      }

      return { res1, res2 };
    },
    []
  );

  const tableResource = useEquipmentAccumulator(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getGoldDragonMatsTable,
    emptyGoldDragonMats,
    reduceGoldDragonRow
  );

  const getGoldDragonStatsTable = useCallback(
    (equipment: EQUIPMENT) => getResource(TAB_KEY.eqGoldDragon, equipment),
    []
  );

  const statDif = useEquipmentStatDiff(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getGoldDragonStatsTable
  );

  const extraInfo: ItemList[] = useMemo(() => {
    const { Jelly, ...perEquipmentRates } = tableResource.res2;
    return [
      { title: "Min. Jelly used", value: Jelly, format: true },
      ...buildRateSummary(perEquipmentRates, [
        { key: "Success Rate", title: "Success Rate", suffix: "%", tag: getSuccessRateTag },
        { key: "Break Rate", title: "Break Rate", suffix: "%", tag: getBreakTag },
        { key: "Fail Deduction", title: "Fail Deduction", tag: getDeductTag },
      ]),
    ];
  }, [tableResource.res2]);

  const getCalculator = () => (
    <EquipmentCalculatorPanel
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
      dataSource={dataSource}
      setDataSource={setDataSource}
      invalid={invalidDtSrc}
      typeFilter={[
        { label: "Armor", keys: ["1", "2", "3", "4", "5"] },
        { label: "Weapon", keys: ["6", "7"] },
      ]}
      range={{
        from: selectFrom,
        to: selectTo,
        onFromChange: setSelectFrom,
        onToChange: setSelectTo,
        max: 20,
      }}
      flags={[
        {
          show: riskDtSrc,
          message:
            "Above +3, the enhancement might fail and even break your item without jelly.",
          type: "warning",
        },
      ]}
      mats={{ data: tableResource.res1, hideZero: true }}
      rateSummary={{ items: extraInfo }}
      stats={{ statDif }}
      tradingHouse={{
        data: [
          { name: "Scale Powder", amt: tableResource.res1["Scale Powder"] },
          { name: "Plate Powder", amt: tableResource.res1["Plate Powder"] },
          { name: "Jewel Fragment", amt: tableResource.res1["Jewel Fragment"] },
        ],
        additionalTotal: tableResource.res1.Gold,
      }}
    />
  );

  // Pure reference data — memoized so it isn't rebuilt (and reconciled,
  // since antd's Collapse keeps inactive panels mounted) on every click in
  // the stateful "Calculate" panel.
  const statContent = useMemo(() => {
    const armorFlags = {
      phyMagAtkMinFlag: true,
      phyMagAtkMaxFlag: true,
      phyMagAtkPercentFlag: true,
      attAtkPercentFlag: true,
      defFlag: true,
      magdefFlag: true,
      hpFlag: true,
      hpPercentFlag: true,
      crtFlag: true,
    };
    const weaponFlags = {
      phyMagAtkMinFlag: true,
      phyMagAtkMaxFlag: true,
      phyMagAtkPercentFlag: true,
      attAtkPercentFlag: true,
      crtFlag: true,
      cdmFlag: true,
      fdFlag: true,
    };
    return (
      <StatReferenceTables
        entries={[
          {
            key: "1",
            label: "Helm",
            dataSource: GoldDragonStatsHelmTable,
            flags: armorFlags,
          },
          {
            key: "2",
            label: "Upper",
            dataSource: GoldDragonStatsUpperTable,
            flags: { ...armorFlags, fdFlag: true },
          },
          {
            key: "3",
            label: "Lower",
            dataSource: GoldDragonStatsLowerTable,
            flags: { ...armorFlags, cdmFlag: true },
          },
          {
            key: "4",
            label: "Glove",
            dataSource: GoldDragonStatsGlovesTable,
            flags: armorFlags,
          },
          {
            key: "5",
            label: "Shoes",
            dataSource: GoldDragonStatsShoesTable,
            flags: { ...armorFlags, moveSpeedPercentFlag: true },
          },
          {
            key: "6",
            label: "Main",
            dataSource: GoldDragonStatsMainTable,
            flags: weaponFlags,
          },
          {
            key: "7",
            label: "Second",
            dataSource: GoldDragonStatsSecondTable,
            flags: weaponFlags,
          },
        ]}
      />
    );
  }, []);

  const matsContent = useMemo(() => (
    <MatsReferenceTables
      defaultActiveKey={"1"}
      entries={[
        {
          key: "1",
          label: "Note",
          content: (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Text>
                * Evolving from Ancient Dragon Equipment (+15 or above)
                decreases the enhancement level by 5, stats do not decrease.
              </Text>
              <Text>
                ** Gold Dragon's Protection Orb (Armor) / Sharp Jewel (Weapon):
                100,000 Gold, 10 Scale Powder, 10 Plate Powder, 10 Jewel
                Fragment.
              </Text>
              <Text>
                * From +4 onward, a failed enhancement may destroy the item
                unless Jelly is used.
              </Text>
              <Text>
                * Beyond +6, there are downgrade intervals every 2 levels.
              </Text>
              <Text>
                ** E.g. Enhance +7 to +8, failure dont have level downgrade.
              </Text>
              <Text>
                ** E.g. Enhance +6 to +7, failure have level downgrade with
                certain probability (become +5).
              </Text>
              <Text>
                * Scale Powder: Gold Dragon Nest Zero. Plate Powder: Gold
                Dragon Nest. Jewel Fragment: Gold Dragon Nest Hardcore (or
                disassemble Gold Dragon Equipment for 5).
              </Text>
            </div>
          ),
        },
        {
          key: "2",
          label: "Armor",
          dataSource: GoldDragonEqEnhanceMaterialArmorTable,
          fields: matsFields,
        },
        {
          key: "3",
          label: "Weapon",
          dataSource: GoldDragonEqEnhanceMaterialWeapTable,
          fields: matsFields,
        },
      ]}
    />
  ), []);

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: statContent,
    },
    {
      key: "2",
      label: "Mats",
      children: matsContent,
    },
    {
      key: "3",
      label: "Calculate",
      children: getCalculator(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default GoldDragonEqContent;
