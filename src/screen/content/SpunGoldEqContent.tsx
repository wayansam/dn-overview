import { Alert, Divider, Radio, Select, Typography } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import EquipmentTable, { getListOpt } from "../../components/EquipmentTable";
import ListingCard, { ItemList } from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import { EQUIPMENT } from "../../constants/InGame.constants";
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
import {
  SpunGoldEqEnhanceMaterialArmorTable,
  SpunGoldEqEnhanceMaterialWeapTable,
  SpunGoldStatsGlovesTable,
  SpunGoldStatsHelmTable,
  SpunGoldStatsLowerTable,
  SpunGoldStatsMainTable,
  SpunGoldStatsSecondTable,
  SpunGoldStatsShoesTable,
  SpunGoldStatsUpperTable,
  dataGoldSpunCalculator,
} from "../../data/SpunGoldEqData";

const { Text } = Typography;

interface TableMaterialList {
  "Shattered Crystal": number;
  "Foundation Stone": number;
  "Dim. Vestige": number;
  Gold: number;
}

const SpunGoldEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CommonEquipmentCalculator[]>(
    dataGoldSpunCalculator
  );
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);

  const invalidDtSrc = useMemo(() => {
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

  const warnDtSrc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!flag && found) {
        if (found.to > 3) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  const dangerDtSrc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!flag && found) {
        if (found.to > 5) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const tableResource: { res1: TableMaterialList } = useMemo(() => {
    let temp: TableMaterialList = {
      "Shattered Crystal": 0,
      "Foundation Stone": 0,
      "Dim. Vestige": 0,
      Gold: 0,
    };

    if (invalidDtSrc) {
      return { res1: temp };
    }

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;
        let tempSlice: SpunGoldEqEnhanceMaterial[] = [];

        switch (equipment) {
          case EQUIPMENT.HELM:
          case EQUIPMENT.UPPER:
          case EQUIPMENT.LOWER:
          case EQUIPMENT.GLOVE:
          case EQUIPMENT.SHOES:
            tempSlice = SpunGoldEqEnhanceMaterialArmorTable.slice(from, to);
            break;

          case EQUIPMENT.MAIN_WEAPON:
          case EQUIPMENT.SECOND_WEAPON:
            tempSlice = SpunGoldEqEnhanceMaterialWeapTable.slice(from, to);
            break;

          default:
            break;
        }

        let shatteredCrystalTemp = 0;
        let foundationStoneTemp = 0;
        let dimVestigeTemp = 0;
        let goldTemp = 0;
        let jellyTemp = 0;

        tempSlice.forEach((slicedItem) => {
          shatteredCrystalTemp += slicedItem.shatteredCrystal;
          foundationStoneTemp += slicedItem.foundationStone;
          dimVestigeTemp += slicedItem.dimVestige;
          goldTemp += slicedItem.gold;
        });

        temp["Shattered Crystal"] += shatteredCrystalTemp;
        temp["Foundation Stone"] += foundationStoneTemp;
        temp["Dim. Vestige"] += dimVestigeTemp;
        temp.Gold += goldTemp;
      }
    });

    return { res1: temp };
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const statDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = {
      encLevel: "0",
    };
    if (invalidDtSrc) {
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
          temp = combineEqStats(dt, temp, "add");
        }
      }
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <EquipmentTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            dataSource={dataSource}
            setDataSource={setDataSource}
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          {invalidDtSrc && (
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
              options={getListOpt(0, 20)}
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
              options={getListOpt(0, 20)}
            />
          </div>
          <Divider orientation="left">Material List</Divider>
          {warnDtSrc && (
            <div>
              <Alert
                banner
                message="Above +3, the enhancement might fail."
                type="info"
              />
            </div>
          )}
          {dangerDtSrc && (
            <div>
              <Alert
                banner
                message="Above +5 even can break your item."
                type="warning"
              />
            </div>
          )}
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
                name: "Shattered Crystal",
                amt: tableResource.res1["Shattered Crystal"],
              },
              {
                name: "Foundation Stone",
                amt: tableResource.res1["Foundation Stone"],
              },
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
        label: "Note",
        children: (
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
        key: "3",
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
        <Collapse items={itemMats} size="small" defaultActiveKey={"1"} />
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
