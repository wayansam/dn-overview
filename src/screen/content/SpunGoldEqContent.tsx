import { Alert, Divider, Radio, Select, Typography } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import EquipmentTable, {
  BasicOpt,
  getListOpt,
} from "../../components/EquipmentTable";
import ListingCard from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import { EmptyCommonnStat } from "../../constants/Common.constants";
import { EQUIPMENT } from "../../constants/InGame.constants";
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
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  columnsResource,
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
  getTextEmpty,
} from "../../utils/common.util";

const { Text } = Typography;

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

  const invalidEnhanceSteps = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!flag && found) {
        if (found.to <= found.from) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

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

  const tableResource: { res1: TableMaterialList } = useMemo(() => {
    let temp: TableMaterialList = {
      "Shattered Armor Crystal": 0,
      "Shattered Weapon Crystal": 0,
      "Foundation Stone": 0,
      "Dim. Vestige": 0,
      Gold: 0,
    };

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to, craft } = found;
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
      }
    });

    return { res1: temp };
  }, [selectedRowKeys, dataSource, invalidEnhanceSteps]);

  const statDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (invalidEnhanceSteps) {
      return temp;
    }

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;

        let tableHolder: CommonItemStats[];
        switch (equipment) {
          case EQUIPMENT.HELM:
            tableHolder = SpunGoldStatsHelmTable;
            break;
          case EQUIPMENT.UPPER:
            tableHolder = SpunGoldStatsUpperTable;
            break;
          case EQUIPMENT.LOWER:
            tableHolder = SpunGoldStatsLowerTable;
            break;
          case EQUIPMENT.GLOVE:
            tableHolder = SpunGoldStatsGlovesTable;
            break;
          case EQUIPMENT.SHOES:
            tableHolder = SpunGoldStatsShoesTable;
            break;

          case EQUIPMENT.MAIN_WEAPON:
            tableHolder = SpunGoldStatsMainTable;
            break;
          case EQUIPMENT.SECOND_WEAPON:
            tableHolder = SpunGoldStatsSecondTable;
            break;

          default:
            tableHolder = [];
            break;
        }
        const { dt1, dt2 } = getComparedData(tableHolder, from + 1, to + 1);
        if (dt2) {
          const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
          temp = combineEqStats(temp, dt, "add");
        }
      }
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidEnhanceSteps]);

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <EquipmentTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            dataSource={dataSource}
            setDataSource={setDataSource}
            craftData={{
              list: SpunOption,
            }}
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          {invalidEnhanceSteps && (
            <div>
              <Alert
                banner
                message="From cannot exceed the To option"
                type="error"
              />
            </div>
          )}
          <Divider orientation="left">Settings</Divider>
          <div style={{ marginBottom: 4 }}>
            Spesific Type
            <Divider type="vertical" />
            <Radio.Group
              value={selectedRowKeys}
              onChange={(e) => {
                setSelectedRowKeys(e.target.value);
              }}
            >
              <Radio.Button
                value={["1", "2", "3", "4", "5"]}
                onClick={() => setSelectedRowKeys(["1", "2", "3", "4", "5"])}
              >
                Armor
              </Radio.Button>
              <Radio.Button
                value={["6", "7"]}
                onClick={() => setSelectedRowKeys(["6", "7"])}
              >
                Weapon
              </Radio.Button>
            </Radio.Group>
          </div>
          <div style={{ marginBottom: 4 }}>
            From
            <Divider type="vertical" />
            <Select
              defaultValue={selectFrom}
              style={{ width: 120 }}
              onChange={(val) => {
                setSelectFrom(val);
              }}
              options={getListOpt(0, 10)}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            To
            <Divider type="vertical" />
            <Select
              defaultValue={selectTo}
              style={{ width: 120 }}
              onChange={(val) => {
                setSelectTo(val);
              }}
              options={getListOpt(0, 10)}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            Craft
            <Divider type="vertical" />
            <Select
              defaultValue={selectTo}
              style={{ width: 120 }}
              onChange={(val) => {
                setSelectCr(val);
              }}
              options={SpunOption[0].option}
            />
          </div>
          <Divider orientation="left">Material List</Divider>
          <Table
            size={"small"}
            dataSource={Object.entries(tableResource.res1)
              .filter(([_, value]) => {
                if (typeof value === "number") {
                  return value !== 0;
                }
                return value.amt !== 0;
              })
              .map(([key, value]) => ({
                mats: key,
                amount: value,
              }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <ListingCard title="Status Increase" data={getStatDif(statDif)} />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <TradingHouseCalc
            data={[
              {
                name: "Dim. Vestige",
                amt: tableResource.res1["Dim. Vestige"],
              },
            ]}
            additionalTotal={tableResource.res1.Gold}
          />
        </div>
      </div>
    );
  };

  const getStatContent = () => {
    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Helm",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={SpunGoldStatsHelmTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              attAtkPercentFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "2",
        label: "Upper",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={SpunGoldStatsUpperTable}
            columns={getColumnsStats({
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
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "3",
        label: "Lower",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={SpunGoldStatsLowerTable}
            columns={getColumnsStats({
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
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "4",
        label: "Glove",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={SpunGoldStatsGlovesTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              attAtkPercentFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "5",
        label: "Shoes",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={SpunGoldStatsShoesTable}
            columns={getColumnsStats({
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
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "6",
        label: "Main",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={SpunGoldStatsMainTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              cdmFlag: true,
              fdFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "7",
        label: "Second",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={SpunGoldStatsSecondTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              cdmFlag: true,
              fdFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Collapse items={itemStat} size="small" />
      </div>
    );
  };

  const getMatsContent = () => {
    const columnsMats: ColumnsType<SpunGoldEqEnhanceMaterial> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Shattered Crystal</p>
            <p>Foundation Stone</p>
            <p>Dim. Vestige</p>
            <p>Gold</p>
          </div>
        ),
        responsive: ["xs"],
        render: (
          _,
          { shatteredCrystal, foundationStone, dimVestige, gold }
        ) => (
          <div>
            <p>{getTextEmpty({ txt: shatteredCrystal })}(crys)</p>
            <p>{getTextEmpty({ txt: foundationStone })}(stone)</p>
            <p>{getTextEmpty({ txt: dimVestige })}(d.ves)</p>
            <p>{getTextEmpty({ txt: gold })}(g)</p>
          </div>
        ),
      },
      {
        title: "Shattered Crystal",
        responsive: ["sm"],
        render: (_, { shatteredCrystal }) => (
          <Text>
            {getTextEmpty({
              txt: shatteredCrystal,
            })}
          </Text>
        ),
      },
      {
        title: "Foundation Stone",
        responsive: ["sm"],
        render: (_, { foundationStone }) => (
          <Text>
            {getTextEmpty({
              txt: foundationStone,
            })}
          </Text>
        ),
      },
      {
        title: "Dim. Vestige",
        responsive: ["sm"],
        render: (_, { dimVestige }) => (
          <Text>
            {getTextEmpty({
              txt: dimVestige,
            })}
          </Text>
        ),
      },
      {
        title: "Gold",
        responsive: ["sm"],
        render: (_, { gold }) => (
          <Text>
            {getTextEmpty({
              txt: gold,
            })}
          </Text>
        ),
      },
    ];
    const itemMats: CollapseProps["items"] = [
      {
        key: "1",
        label: "Armor",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={SpunGoldEqEnhanceMaterialArmorTable}
            columns={columnsMats}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "2",
        label: "Weapon",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={SpunGoldEqEnhanceMaterialWeapTable}
            columns={columnsMats}
            pagination={false}
            bordered
          />
        ),
      },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Collapse items={itemMats} size="small" />
      </div>
    );
  };

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
