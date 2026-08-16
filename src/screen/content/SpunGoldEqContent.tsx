import { Divider, Select } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import { useCallback, useEffect, useMemo, useState } from "react";
import CalcCard from "../../components/CalcCard";
import { CraftMaterialField } from "../../components/CraftMaterialColumns";
import EquipmentTable, {
  BasicOpt,
  makeEquipmentSelectColumn,
} from "../../components/EquipmentTable";
import FlagAlert from "../../components/FlagAlert";
import ListingCard from "../../components/ListingCard";
import MaterialListTable from "../../components/MaterialListTable";
import MatsReferenceTables from "../../components/MatsReferenceTables";
import RangeFromTo from "../../components/RangeFromTo";
import StatReferenceTables from "../../components/StatReferenceTables";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import TypeFilterToggle from "../../components/TypeFilterToggle";
import { TAB_KEY } from "../../constants/Common.constants";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  useEquipmentStatDiff,
  useInvalidRange,
  useSelectedRows,
} from "../../hooks/useEquipmentCalculator";
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
} from "../../data/SpunGoldEqData";
import { CommonEquipmentCalculator } from "../../interface/Common.interface";
import { SpunGoldEqEnhanceMaterial } from "../../interface/Item.interface";
import { getStatDif } from "../../utils/common.util";
import { getResource } from "../../utils/resource.util";

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

  const selectedRows = useSelectedRows(selectedRowKeys, dataSource);

  const tableResource: { res1: TableMaterialList } = useMemo(() => {
    let temp: TableMaterialList = {
      "Shattered Armor Crystal": 0,
      "Shattered Weapon Crystal": 0,
      "Foundation Stone": 0,
      "Dim. Vestige": 0,
      Gold: 0,
    };

    selectedRows.forEach(({ equipment, from, to, craft }) => {
      let tempSlice: SpunGoldEqEnhanceMaterial[] = [];
      let tempCraft: SpunGoldEqEnhanceMaterial | undefined = undefined;

      switch (equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          if (!invalidEnhanceSteps) {
            tempSlice = SpunGoldEqEnhanceMaterialArmorTable.slice(from, to);
          }
          if (craft === 1) {
            tempCraft = SpunGoldEvolverCraftArmorT1;
          }
          if (craft === 2) {
            tempCraft = SpunGoldEvolverCraftArmorT2;
          }
          break;

        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          if (!invalidEnhanceSteps) {
            tempSlice = SpunGoldEqEnhanceMaterialWeapTable.slice(from, to);
          }
          if (craft === 2) {
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

      tempSlice.forEach((slicedItem) => {
        shatteredCrystalTemp += slicedItem.shatteredCrystal;
        foundationStoneTemp += slicedItem.foundationStone;
        dimVestigeTemp += slicedItem.dimVestige;
        goldTemp += slicedItem.gold;
      });

      switch (equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          temp["Shattered Armor Crystal"] += shatteredCrystalTemp;
          break;

        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          temp["Shattered Weapon Crystal"] += shatteredCrystalTemp;
          break;

        default:
          break;
      }

      temp["Foundation Stone"] += foundationStoneTemp;
      temp["Dim. Vestige"] += dimVestigeTemp;
      temp.Gold += goldTemp;
    });

    return { res1: temp };
  }, [selectedRows, invalidEnhanceSteps]);

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

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <CalcCard>
          <EquipmentTable
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
          />
        </CalcCard>
        <CalcCard>
          <FlagAlert
            show={invalidEnhanceSteps}
            message="From cannot exceed the To option"
            type="error"
          />
          <Divider orientation="left">Settings</Divider>
          <TypeFilterToggle
            selectedRowKeys={selectedRowKeys}
            onChange={setSelectedRowKeys}
            options={[
              { label: "Armor", keys: ["1", "2", "3", "4", "5"] },
              { label: "Weapon", keys: ["6", "7"] },
            ]}
          />
          <RangeFromTo
            from={selectFrom}
            to={selectTo}
            onFromChange={setSelectFrom}
            onToChange={setSelectTo}
            max={10}
          />
          <div style={{ marginBottom: 4 }}>
            Craft
            <Divider type="vertical" />
            <Select
              defaultValue={selectCr}
              style={{ width: 120 }}
              onChange={(val) => {
                setSelectCr(val);
              }}
              options={SpunOption[0].option}
            />
          </div>
          <MaterialListTable data={tableResource.res1} hideZero />
        </CalcCard>
        <CalcCard>
          <ListingCard title="Status Increase" data={getStatDif(statDif)} />
        </CalcCard>
        <CalcCard>
          <TradingHouseCalc
            data={[
              {
                name: "Dim. Vestige",
                amt: tableResource.res1["Dim. Vestige"],
              },
            ]}
            additionalTotal={tableResource.res1.Gold}
          />
        </CalcCard>
      </div>
    );
  };

  const getStatContent = () => (
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
  );

  const matsFields: CraftMaterialField<SpunGoldEqEnhanceMaterial>[] = [
    { dataIndex: "shatteredCrystal", label: "Shattered Crystal", shortLabel: "(crys)" },
    { dataIndex: "foundationStone", label: "Foundation Stone", shortLabel: "(stone)" },
    { dataIndex: "dimVestige", label: "Dim. Vestige", shortLabel: "(d.ves)" },
    { dataIndex: "gold", label: "Gold", shortLabel: "(g)" },
  ];

  const getMatsContent = () => (
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

export default SpunGoldEqContent;
