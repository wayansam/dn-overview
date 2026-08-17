import { Typography } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CraftMaterialField } from "../../components/CraftMaterialColumns";
import EquipmentCalculatorPanel from "../../components/EquipmentCalculatorPanel";
import { ItemList } from "../../components/ListingCard";
import MatsReferenceTables from "../../components/MatsReferenceTables";
import StatReferenceTables from "../../components/StatReferenceTables";
import { TAB_KEY } from "../../constants/Common.constants";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  useEquipmentAccumulator,
  useEquipmentStatDiff,
  useInvalidRange,
  useSelectionFlag,
} from "../../hooks/useEquipmentCalculator";
import {
  BoneDragonEqEnhanceMaterialArmorTable,
  BoneDragonEqEnhanceMaterialWeapTable,
  BoneDragonStatsGlovesTable,
  BoneDragonStatsHelmTable,
  BoneDragonStatsLowerTable,
  BoneDragonStatsMainTable,
  BoneDragonStatsSecondTable,
  BoneDragonStatsShoesTable,
  BoneDragonStatsUpperTable,
  dataBoneCalculator,
} from "../../data/BoneDragonEqData";
import { BoneCalculator } from "../../interface/Common.interface";
import { BoneDragonEqEnhanceMaterial } from "../../interface/Item.interface";
import {
  getBreakTag,
  getDeductTag,
  getSuccessRateTag,
} from "../../utils/common.util";
import { buildRateSummary } from "../../utils/rateSummary";
import { getResource } from "../../utils/resource.util";

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
  "Bone Fragment": number;
  Garnet: number;
  Essence: number;
  Gold: number;
}

const BoneDragonEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<BoneCalculator[]>(dataBoneCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);

  const invalidDtSrc = useInvalidRange(selectedRowKeys, dataSource);
  const warnDtSrc = useSelectionFlag(selectedRowKeys, dataSource, (row) => row.to > 3);
  const dangerDtSrc = useSelectionFlag(selectedRowKeys, dataSource, (row) => row.to > 5);

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const emptyBoneDragonMats: { res1: TableMaterialList; res2: ExtraData } = {
    res1: { "Bone Fragment": 0, Garnet: 0, Essence: 0, Gold: 0 },
    res2: { Jelly: 0 },
  };

  const getBoneDragonMatsTable = useCallback(
    (equipment: EQUIPMENT): BoneDragonEqEnhanceMaterial[] => {
      switch (equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          return BoneDragonEqEnhanceMaterialArmorTable;

        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          return BoneDragonEqEnhanceMaterialWeapTable;

        default:
          return [];
      }
    },
    []
  );

  const reduceBoneDragonRow = useCallback(
    (
      acc: { res1: TableMaterialList; res2: ExtraData },
      slice: BoneDragonEqEnhanceMaterial[],
      row: BoneCalculator
    ): { res1: TableMaterialList; res2: ExtraData } => {
      const res1 = { ...acc.res1 };
      const res2 = { ...acc.res2 };

      let boneFragmentTemp = 0;
      let garnetTemp = 0;
      let essenceTemp = 0;
      let goldTemp = 0;
      let jellyTemp = 0;
      let srTemp: number[] = [];
      let brTemp: number[] = [];
      let deTemp: Array<number | undefined> = [];

      slice.forEach((slicedItem) => {
        boneFragmentTemp += slicedItem.boneFragment;
        garnetTemp += slicedItem.garnet;
        essenceTemp += slicedItem.essence;
        goldTemp += slicedItem.gold;
        jellyTemp += slicedItem.jelly ?? 0;
        srTemp.push(slicedItem.successRatePercent);
        brTemp.push(slicedItem.breakNoJellyPercent);
        deTemp.push(slicedItem.enhanceFailDeduction);
      });

      res1["Bone Fragment"] += boneFragmentTemp;
      res1.Garnet += garnetTemp;
      res1.Essence += essenceTemp;
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
    getBoneDragonMatsTable,
    emptyBoneDragonMats,
    reduceBoneDragonRow
  );

  const getBoneDragonStatsTable = useCallback(
    (equipment: EQUIPMENT) => getResource(TAB_KEY.eqBoneDragon, equipment),
    []
  );

  const statDif = useEquipmentStatDiff(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getBoneDragonStatsTable
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
          show: warnDtSrc,
          message: "Above +3, the enhancement might fail.",
          type: "info",
        },
        {
          show: dangerDtSrc,
          message: "Above +5 even can break your item.",
          type: "warning",
        },
      ]}
      mats={{ data: tableResource.res1, hideZero: true }}
      rateSummary={{ items: extraInfo }}
      stats={{ statDif }}
      tradingHouse={{
        data: [
          { name: "Bone Fragment", amt: tableResource.res1["Bone Fragment"] },
          { name: "Garnet", amt: tableResource.res1.Garnet },
          { name: "Essence", amt: tableResource.res1.Essence },
        ],
        additionalTotal: tableResource.res1.Gold,
      }}
    />
  );

  const getStatContent = () => {
    return (
      <StatReferenceTables
        entries={[
          {
            key: "1",
            label: "Helm",
            dataSource: BoneDragonStatsHelmTable,
            flags: {
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              attAtkPercentFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
            },
          },
          {
            key: "2",
            label: "Upper",
            dataSource: BoneDragonStatsUpperTable,
            flags: {
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              fdFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              attAtkPercentFlag: true,
            },
          },
          {
            key: "3",
            label: "Lower",
            dataSource: BoneDragonStatsLowerTable,
            flags: {
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              cdmFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              attAtkPercentFlag: true,
            },
          },
          {
            key: "4",
            label: "Glove",
            dataSource: BoneDragonStatsGlovesTable,
            flags: {
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              attAtkPercentFlag: true,
            },
          },
          {
            key: "5",
            label: "Shoes",
            dataSource: BoneDragonStatsShoesTable,
            flags: {
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              attAtkPercentFlag: true,
            },
          },
          {
            key: "6",
            label: "Main",
            dataSource: BoneDragonStatsMainTable,
            flags: {
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              cdmFlag: true,
              fdFlag: true,
            },
          },
          {
            key: "7",
            label: "Second",
            dataSource: BoneDragonStatsSecondTable,
            flags: {
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              cdmFlag: true,
              fdFlag: true,
            },
          },
        ]}
      />
    );
  };

  const matsFields: CraftMaterialField<BoneDragonEqEnhanceMaterial>[] = [
    { dataIndex: "boneFragment", label: "Bone Fragment", shortLabel: "(Bone Fragment)" },
    { dataIndex: "garnet", label: "Garnet", shortLabel: "(Garnet)" },
    { dataIndex: "essence", label: "Essence", shortLabel: "(Essence)" },
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

  const getMatsContent = () => (
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
                * Beyond +10, there are downgrade intervals every 2 levels.
              </Text>
              <Text>
                ** E.g. Enhance +10 to +11, failure dont have level downgrade.
              </Text>
              <Text>
                ** E.g. Enhance +11 to +12, failure have level downgrade with
                certain probability (become +10).
              </Text>
            </div>
          ),
        },
        {
          key: "2",
          label: "Armor",
          dataSource: BoneDragonEqEnhanceMaterialArmorTable,
          fields: matsFields,
        },
        {
          key: "3",
          label: "Weapon",
          dataSource: BoneDragonEqEnhanceMaterialWeapTable,
          fields: matsFields,
        },
      ]}
    />
  );

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: getStatContent(),
    },
    {
      key: "2",
      label: "Mats",
      children: getMatsContent(),
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

export default BoneDragonEqContent;
