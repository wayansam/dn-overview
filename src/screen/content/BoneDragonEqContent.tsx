import { Divider, Typography } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import { useCallback, useEffect, useMemo, useState } from "react";
import CalcCard from "../../components/CalcCard";
import { CraftMaterialField } from "../../components/CraftMaterialColumns";
import EquipmentTable from "../../components/EquipmentTable";
import FlagAlert from "../../components/FlagAlert";
import ListingCard, { ItemList } from "../../components/ListingCard";
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
  getStatDif,
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

  const selectedRows = useSelectedRows(selectedRowKeys, dataSource);

  const tableResource: { res1: TableMaterialList; res2: ExtraData } =
    useMemo(() => {
      let temp: TableMaterialList = {
        "Bone Fragment": 0,
        Garnet: 0,
        Essence: 0,
        Gold: 0,
      };
      let temp2: ExtraData = {
        Jelly: 0,
      };
      if (invalidDtSrc) {
        return { res1: temp, res2: temp2 };
      }

      selectedRows.forEach(({ equipment, from, to }) => {
        let tempSlice: BoneDragonEqEnhanceMaterial[] = [];

        switch (equipment) {
          case EQUIPMENT.HELM:
          case EQUIPMENT.UPPER:
          case EQUIPMENT.LOWER:
          case EQUIPMENT.GLOVE:
          case EQUIPMENT.SHOES:
            tempSlice = BoneDragonEqEnhanceMaterialArmorTable.slice(from, to);
            break;

          case EQUIPMENT.MAIN_WEAPON:
          case EQUIPMENT.SECOND_WEAPON:
            tempSlice = BoneDragonEqEnhanceMaterialWeapTable.slice(from, to);
            break;

          default:
            break;
        }

        let boneFragmentTemp = 0;
        let garnetTemp = 0;
        let essenceTemp = 0;
        let goldTemp = 0;
        let jellyTemp = 0;
        let srTemp: number[] = [];
        let brTemp: number[] = [];
        let deTemp: Array<number | undefined> = [];

        tempSlice.forEach((slicedItem) => {
          boneFragmentTemp += slicedItem.boneFragment;
          garnetTemp += slicedItem.garnet;
          essenceTemp += slicedItem.essence;
          goldTemp += slicedItem.gold;
          jellyTemp += slicedItem.jelly ?? 0;
          srTemp.push(slicedItem.successRatePercent);
          brTemp.push(slicedItem.breakNoJellyPercent);
          deTemp.push(slicedItem.enhanceFailDeduction);
        });

        temp["Bone Fragment"] += boneFragmentTemp;
        temp.Garnet += garnetTemp;
        temp.Essence += essenceTemp;
        temp.Gold += goldTemp;
        temp2.Jelly += jellyTemp;

        const exData = {
          "Success Rate": srTemp,
          "Break Rate": brTemp,
          "Fail Deduction": deTemp,
        };
        switch (equipment) {
          case EQUIPMENT.HELM:
          case EQUIPMENT.UPPER:
          case EQUIPMENT.LOWER:
          case EQUIPMENT.GLOVE:
          case EQUIPMENT.SHOES:
          case EQUIPMENT.MAIN_WEAPON:
          case EQUIPMENT.SECOND_WEAPON:
            temp2[equipment] = exData;
            break;

          default:
            break;
        }
      });

      return { res1: temp, res2: temp2 };
    }, [selectedRows, invalidDtSrc]);

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

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <CalcCard>
          <EquipmentTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            dataSource={dataSource}
            setDataSource={setDataSource}
          />
        </CalcCard>
        <CalcCard>
          <FlagAlert
            show={invalidDtSrc}
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
            max={20}
          />
          <FlagAlert
            show={warnDtSrc}
            message="Above +3, the enhancement might fail."
            type="info"
          />
          <FlagAlert
            show={dangerDtSrc}
            message="Above +5 even can break your item."
            type="warning"
          />
          <MaterialListTable data={tableResource.res1} hideZero />
        </CalcCard>
        <CalcCard>
          <ListingCard keyId="extra-info" title="Extra Info" data={extraInfo} />
        </CalcCard>
        <CalcCard>
          <ListingCard title="Status Increase" data={getStatDif(statDif)} />
        </CalcCard>
        <CalcCard>
          <TradingHouseCalc
            data={[
              {
                name: "Bone Fragment",
                amt: tableResource.res1["Bone Fragment"],
              },
              {
                name: "Garnet",
                amt: tableResource.res1.Garnet,
              },
              {
                name: "Essence",
                amt: tableResource.res1.Essence,
              },
            ]}
            additionalTotal={tableResource.res1.Gold}
          />
        </CalcCard>
      </div>
    );
  };

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
