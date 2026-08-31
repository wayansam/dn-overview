import Collapse, { CollapseProps } from "antd/es/collapse";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CraftMaterialField } from "../../../components/CraftMaterialColumns";
import EquipmentCalculatorPanel from "../../../components/EquipmentCalculatorPanel";
import { BasicOpt, makeEquipmentSelectColumn } from "../../../components/EquipmentTable";
import MatsReferenceTables from "../../../components/MatsReferenceTables";
import StatReferenceTables from "../../../components/StatReferenceTables";
import { TAB_KEY } from "../../../constants/Common.constants";
import { EQUIPMENT } from "../../../constants/InGame.constants";
import {
  useEquipmentAccumulator,
  useEquipmentStatDiff,
  useInvalidRange,
} from "../../../hooks/useEquipmentCalculator";
import {
  SpunGoldEqEnhanceMaterialArmorTable,
  SpunGoldEqEnhanceMaterialWeapTable,
  SpunGoldEvolverCraftArmorT1,
  SpunGoldEvolverCraftArmorT2,
  SpunGoldEvolverCraftWeapon,
  SpunGoldStatsGlovesTable,
  SpunGoldStatsHelmTable,
  SpunGoldStatsLowerTable,
  SpunGoldStatsMainTable,
  SpunGoldStatsSecondTable,
  SpunGoldStatsShoesTable,
  SpunGoldStatsUpperTable,
  dataGoldSpunCalculator,
} from "../../../data/equipment/SpunGoldEqData";
import { CommonEquipmentCalculator } from "../../../interface/Common.interface";
import { SpunGoldEqEnhanceMaterial } from "../../../interface/Item.interface";
import { getResource } from "../../../utils/resource.util";

interface TableMaterialList {
  "Shattered Armor Crystal": number;
  "Shattered Weapon Crystal": number;
  "Foundation Stone": number;
  "Dim. Vestige": number;
  Gold: number;
}

const SpunOption: BasicOpt[] = [
  {
    key: [
      EQUIPMENT.HELM,
      EQUIPMENT.UPPER,
      EQUIPMENT.LOWER,
      EQUIPMENT.GLOVE,
      EQUIPMENT.SHOES,
    ],
    option: [
      { label: "No", value: 0 },
      { label: "Tier 1", value: 1 },
      { label: "Tier 2", value: 2 },
    ],
  },
  {
    key: [EQUIPMENT.MAIN_WEAPON, EQUIPMENT.SECOND_WEAPON],
    option: [
      { label: "No", value: 0 },
      { label: "Tier 2", value: 2 },
    ],
  },
];

const matsFields: CraftMaterialField<SpunGoldEqEnhanceMaterial>[] = [
  { dataIndex: "shatteredCrystal", label: "Shattered Crystal", shortLabel: "(crys)" },
  { dataIndex: "foundationStone", label: "Foundation Stone", shortLabel: "(stone)" },
  { dataIndex: "dimVestige", label: "Dim. Vestige", shortLabel: "(d.ves)" },
  { dataIndex: "gold", label: "Gold", shortLabel: "(g)" },
];

const SpunGoldEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<
    CommonEquipmentCalculator<{ craft: number }>[]
  >(dataGoldSpunCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(0);
  const [selectCr, setSelectCr] = useState<number>(0);

  const invalidEnhanceSteps = useInvalidRange(selectedRowKeys, dataSource);

  useEffect(() => {
    const getCraftValue = (
      eq: EQUIPMENT,
      selected: number,
      current: number
    ) => {
      const craftOpt = SpunOption.find((it) => it.key.includes(eq));
      if (craftOpt) {
        const found = craftOpt?.option?.find((i) => i.value === selected);
        return found ? found.value : current;
      }
      return 0;
    };
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
      craft: getCraftValue(item.equipment, selectCr, item.craft),
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo, selectCr]);

  const getSpunGoldMatsTable = useCallback(
    (equipment: EQUIPMENT): SpunGoldEqEnhanceMaterial[] => {
      switch (equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          return SpunGoldEqEnhanceMaterialArmorTable;

        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          return SpunGoldEqEnhanceMaterialWeapTable;

        default:
          return [];
      }
    },
    []
  );

  const emptySpunGoldMats: TableMaterialList = {
    "Shattered Armor Crystal": 0,
    "Shattered Weapon Crystal": 0,
    "Foundation Stone": 0,
    "Dim. Vestige": 0,
    Gold: 0,
  };

  const reduceSpunGoldRow = useCallback(
    (
      acc: TableMaterialList,
      slice: SpunGoldEqEnhanceMaterial[],
      row: CommonEquipmentCalculator<{ craft: number }>
    ): TableMaterialList => {
      const next = { ...acc };

      let tempCraft: SpunGoldEqEnhanceMaterial | undefined = undefined;
      switch (row.equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          if (row.craft === 1) {
            tempCraft = SpunGoldEvolverCraftArmorT1;
          }
          if (row.craft === 2) {
            tempCraft = SpunGoldEvolverCraftArmorT2;
          }
          break;

        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          if (row.craft === 2) {
            tempCraft = SpunGoldEvolverCraftWeapon;
          }
          break;

        default:
          break;
      }

      let shatteredCrystalTemp = tempCraft?.shatteredCrystal ?? 0;
      let foundationStoneTemp = tempCraft?.foundationStone ?? 0;
      let dimVestigeTemp = tempCraft?.dimVestige ?? 0;
      let goldTemp = tempCraft?.gold ?? 0;

      slice.forEach((slicedItem) => {
        shatteredCrystalTemp += slicedItem.shatteredCrystal;
        foundationStoneTemp += slicedItem.foundationStone;
        dimVestigeTemp += slicedItem.dimVestige;
        goldTemp += slicedItem.gold;
      });

      switch (row.equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          next["Shattered Armor Crystal"] += shatteredCrystalTemp;
          break;

        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          next["Shattered Weapon Crystal"] += shatteredCrystalTemp;
          break;

        default:
          break;
      }

      next["Foundation Stone"] += foundationStoneTemp;
      next["Dim. Vestige"] += dimVestigeTemp;
      next.Gold += goldTemp;

      return next;
    },
    []
  );

  const tableResource = useEquipmentAccumulator(
    selectedRowKeys,
    dataSource,
    invalidEnhanceSteps,
    getSpunGoldMatsTable,
    emptySpunGoldMats,
    reduceSpunGoldRow
  );

  const getSpunGoldStatsTable = useCallback(
    (equipment: EQUIPMENT) => getResource(TAB_KEY.eqSpunGold, equipment),
    []
  );

  const statDif = useEquipmentStatDiff(
    selectedRowKeys,
    dataSource,
    invalidEnhanceSteps,
    getSpunGoldStatsTable
  );

  const getCalculator = () => (
    <EquipmentCalculatorPanel
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
      dataSource={dataSource}
      setDataSource={setDataSource}
      extraColumns={[
        makeEquipmentSelectColumn<CommonEquipmentCalculator<{ craft: number }>>(
          "craft",
          "Craft",
          SpunOption
        ),
      ]}
      invalid={invalidEnhanceSteps}
      typeFilter={[
        { label: "Armor", keys: ["1", "2", "3", "4", "5"] },
        { label: "Weapon", keys: ["6", "7"] },
      ]}
      range={{
        from: selectFrom,
        to: selectTo,
        onFromChange: setSelectFrom,
        onToChange: setSelectTo,
        max: 10,
      }}
      selects={[
        {
          key: "craft",
          label: "Craft",
          value: selectCr,
          onChange: (val) => setSelectCr(val as number),
          options: SpunOption[0].option,
        },
      ]}
      mats={{ data: tableResource, hideZero: true }}
      stats={{ statDif }}
      tradingHouse={{
        data: [{ name: "Dim. Vestige", amt: tableResource["Dim. Vestige"] }],
        additionalTotal: tableResource.Gold,
      }}
    />
  );

  // Pure reference data — memoized so it isn't rebuilt (and reconciled,
  // since antd's Collapse keeps inactive panels mounted) on every click in
  // the stateful "Calculate" panel.
  const statContent = useMemo(
    () => (
    <StatReferenceTables
      entries={[
        {
          key: "1",
          label: "Helm",
          dataSource: SpunGoldStatsHelmTable,
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
          dataSource: SpunGoldStatsUpperTable,
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
          dataSource: SpunGoldStatsLowerTable,
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
          dataSource: SpunGoldStatsGlovesTable,
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
          dataSource: SpunGoldStatsShoesTable,
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
            moveSpeedPercentFlag: true,
          },
        },
        {
          key: "6",
          label: "Main",
          dataSource: SpunGoldStatsMainTable,
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
          dataSource: SpunGoldStatsSecondTable,
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
    ),
    []
  );

  const matsContent = useMemo(
    () => (
    <MatsReferenceTables
      entries={[
        {
          key: "1",
          label: "Armor",
          dataSource: SpunGoldEqEnhanceMaterialArmorTable,
          fields: matsFields,
        },
        {
          key: "2",
          label: "Weapon",
          dataSource: SpunGoldEqEnhanceMaterialWeapTable,
          fields: matsFields,
        },
      ]}
    />
    ),
    []
  );

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

export default SpunGoldEqContent;
