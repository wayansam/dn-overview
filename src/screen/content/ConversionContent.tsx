import {
  Alert,
  Collapse,
  CollapseProps,
  Divider,
  Select,
  Table,
  Radio,
  Typography,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  dataConversionCalculator,
  conversionHelmStats,
  conversionUpperStats,
  conversionLowerStats,
  conversionGloveStats,
  conversionShoesStats,
  conversionMainStats,
  conversionSecondStats,
  conversionNecklaceStats,
  conversionEarringStats,
  conversionRingStats,
  conversionWingStats,
  conversionTailStats,
  conversionDecalStats,
} from "../../data/ConversionCalculatorData";
import { CommonEquipmentCalculator } from "../../interface/Common.interface";
import {
  columnsResource,
  getComparedData,
  getColumnsStats,
  combineEqStats,
  getStatDif,
} from "../../utils/common.util";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import ListingCard from "../../components/ListingCard";
import { EmptyCommonnStat } from "../../constants/Common.constants";
import EquipmentTable from "../../components/EquipmentTable";

const { Text } = Typography;

interface TableMaterialList {
  "Armor Fragment": number;
  "Acc Fragment": number;
  "Wtd Fragment": number;
  "Weapon Fragment": number;
  "Astral Powder": number;
  "Astral Stone": number;
}

const getLabel = (item: number) => {
  if (item === 0) {
    return "Buy";
  }
  if (item >= 12) {
    return `Legend +${item - 12}`;
  }
  return `+${item - 1}`;
};

const opt = (start: number, end: number) =>
  Array.from({ length: end + 1 - start }, (_, k) => k + start).map((item) => ({
    label: getLabel(item),
    value: item,
  }));

const CONV_FRAG = 3500;
const WEAP_FRAG = 1;
const EV_AST_STONE = 3;
const EV_AST_POW_ARMOR = 1000;
const EV_AST_POW_WEAP = 1500;
const EV_AST_POW_ACC = 1150;
const EV_AST_POW_WTD = 1300;
const WEAP_ENH_SUC_RATE = [50, 40, 35, 20, 10, 7, 5, 5, 3, 3];
const ENC_AST_POW_ARMOR = 450;
const ENC_AST_STONE_ARMOR = 1;
const ENC_AST_POW_ACC = 500;
const ENC_AST_STONE_ACC = 3;

const ConversionContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CommonEquipmentCalculator[]>(
    dataConversionCalculator
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

  const tableResource: TableMaterialList = useMemo(() => {
    let temp: TableMaterialList = {
      "Armor Fragment": 0,
      "Acc Fragment": 0,
      "Wtd Fragment": 0,
      "Weapon Fragment": 0,
      "Astral Powder": 0,
      "Astral Stone": 0,
    };
    if (invalidDtSrc) {
      return temp;
    }

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;
        const isBuy = from === 0;
        const isEnhUnique = to <= 11 && from <= 11;
        const isEvo = to >= 12 && from <= 11;
        let frag =
          (Math.min(to, 11) - Math.max(isEnhUnique ? from : 11, 1)) *
            CONV_FRAG +
          (isBuy ? CONV_FRAG : 0);

        let lgFrag = 0;
        let lgStone = 0;
        let enhLRange = Math.min(to, 15) - Math.max(from, 1) - (isEvo ? 1 : 0);
        switch (equipment) {
          case EQUIPMENT.HELM:
          case EQUIPMENT.UPPER:
          case EQUIPMENT.LOWER:
          case EQUIPMENT.GLOVE:
          case EQUIPMENT.SHOES:
            temp["Armor Fragment"] += frag;
            if (isEvo) {
              lgFrag += EV_AST_POW_ARMOR;
              lgStone += EV_AST_STONE;
            }
            if (!isEnhUnique) {
              lgFrag += enhLRange * ENC_AST_POW_ARMOR;
              lgStone += enhLRange * ENC_AST_STONE_ARMOR;
            }
            break;

          case EQUIPMENT.MAIN_WEAPON:
          case EQUIPMENT.SECOND_WEAPON:
            if (isEvo) {
              lgFrag += EV_AST_POW_WEAP;
              lgStone += EV_AST_STONE;
            }
            break;

          case EQUIPMENT.NECKLACE:
          case EQUIPMENT.EARRING:
          case EQUIPMENT.RING1:
          case EQUIPMENT.RING2:
            temp["Acc Fragment"] += frag;
            if (isEvo) {
              lgFrag += EV_AST_POW_ACC;
              lgStone += EV_AST_STONE;
            }
            if (!isEnhUnique) {
              lgFrag += enhLRange * ENC_AST_POW_ACC;
              lgStone += enhLRange * ENC_AST_STONE_ACC;
            }
            break;

          case EQUIPMENT.WING:
          case EQUIPMENT.TAIL:
          case EQUIPMENT.DECAL:
            temp["Wtd Fragment"] += frag;
            if (isEvo) {
              lgFrag += EV_AST_POW_WTD;
              lgStone += EV_AST_STONE;
            }
            break;

          default:
            break;
        }

        temp["Astral Powder"] += lgFrag;
        temp["Astral Stone"] += lgStone;
      }
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const statDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
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
            tableHolder = conversionHelmStats;
            break;
          case EQUIPMENT.UPPER:
            tableHolder = conversionUpperStats;
            break;
          case EQUIPMENT.LOWER:
            tableHolder = conversionLowerStats;
            break;
          case EQUIPMENT.GLOVE:
            tableHolder = conversionGloveStats;
            break;
          case EQUIPMENT.SHOES:
            tableHolder = conversionShoesStats;
            break;

          case EQUIPMENT.MAIN_WEAPON:
            tableHolder = conversionMainStats;
            break;
          case EQUIPMENT.SECOND_WEAPON:
            tableHolder = conversionSecondStats;
            break;

          case EQUIPMENT.NECKLACE:
            tableHolder = conversionNecklaceStats;
            break;
          case EQUIPMENT.EARRING:
            tableHolder = conversionEarringStats;
            break;
          case EQUIPMENT.RING1:
          case EQUIPMENT.RING2:
            tableHolder = conversionRingStats;
            break;

          case EQUIPMENT.WING:
            tableHolder = conversionWingStats;
            break;
          case EQUIPMENT.TAIL:
            tableHolder = conversionTailStats;
            break;
          case EQUIPMENT.DECAL:
            tableHolder = conversionDecalStats;
            break;

          default:
            tableHolder = [];
            break;
        }
        const { dt1, dt2 } = getComparedData(tableHolder, from, to);
        if (dt2) {
          const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
          temp = combineEqStats(temp, dt, "add");
        }
      }
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const tempComp = (str: string, arr: number[]) =>
    arr.length > 0 ? (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text>{str} succes rate from the smaller enhancement</Text>
        <Text>{arr.map((it) => `${it}%`).join(", ")}</Text>
      </div>
    ) : undefined;

  const weaponNotes = useMemo(() => {
    if (invalidDtSrc) {
      return;
    }
    let temp: {
      main: JSX.Element | undefined;
      second: JSX.Element | undefined;
    } = {
      main: undefined,
      second: undefined,
    };
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (found) {
        const { equipment, from, to } = found;
        const tempSlice = WEAP_ENH_SUC_RATE.slice(
          Math.max(from, 1) - 1,
          Math.min(to, 11) - 1
        );

        switch (equipment) {
          case EQUIPMENT.MAIN_WEAPON:
            temp.main = tempComp("Main Weapon", tempSlice);
            break;
          case EQUIPMENT.SECOND_WEAPON:
            temp.second = tempComp("Second Weapon", tempSlice);
            break;

          default:
            break;
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from:
        selectFrom < item.min
          ? item.min
          : selectFrom >= item.max
          ? item.max
          : selectFrom,
      to: selectTo > item.max ? item.max : selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <EquipmentTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            dataSource={dataSource}
            setDataSource={setDataSource}
            customLabeling={(item) => getLabel(item)}
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
              <Radio.Button
                value={["8", "9", "10", "11"]}
                onClick={() => setSelectedRowKeys(["8", "9", "10", "11"])}
              >
                Accessories
              </Radio.Button>
              <Radio.Button
                value={["12", "13", "14"]}
                onClick={() => setSelectedRowKeys(["12", "13", "14"])}
              >
                WTD
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
              options={opt(0, 15)}
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
              options={opt(0, 15)}
            />
          </div>
          <Divider orientation="left">Material List</Divider>
          <Table
            size={"small"}
            dataSource={Object.entries(tableResource)
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
          {weaponNotes?.main}
          {weaponNotes?.second}
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <ListingCard title="Status Increase" data={getStatDif(statDif)} />
        </div>
      </div>
    );
  };

  const getStatContent = () => {
    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Armor",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Helm"}
              size={"small"}
              dataSource={conversionHelmStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                strPercentFlag: true,
                agiPercentFlag: true,
                intPercentFlag: true,
                vitPercentFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Upper"}
              size={"small"}
              dataSource={conversionUpperStats}
              columns={getColumnsStats({
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                strPercentFlag: true,
                agiPercentFlag: true,
                intPercentFlag: true,
                vitPercentFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Lower"}
              size={"small"}
              dataSource={conversionLowerStats}
              columns={getColumnsStats({
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Glove"}
              size={"small"}
              dataSource={conversionGloveStats}
              columns={getColumnsStats({
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Shoes"}
              size={"small"}
              dataSource={conversionShoesStats}
              columns={getColumnsStats({
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                strPercentFlag: true,
                agiPercentFlag: true,
                intPercentFlag: true,
                vitPercentFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
                moveSpeedPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "2",
        label: "Weapon",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Main"}
              size={"small"}
              dataSource={conversionMainStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                cdmFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Second"}
              size={"small"}
              dataSource={conversionSecondStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
              })}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "3",
        label: "Accesories",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Necklace"}
              size={"small"}
              dataSource={conversionNecklaceStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                defFlag: true,
                magdefFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Earring"}
              size={"small"}
              dataSource={conversionEarringStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Ring"}
              size={"small"}
              dataSource={conversionRingStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
              })}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "4",
        label: "WTD",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Wing"}
              footer={() => "*Legend stats based on KDN patch note"}
              size={"small"}
              dataSource={conversionWingStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
                vitFlag: true,
                moveSpeedPercentFlag: true,
                moveSpeedPercentTownFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Tail"}
              footer={() => "*Legend stats based on KDN patch note"}
              size={"small"}
              dataSource={conversionTailStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                defPercentFlag: true,
                magdefPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Decal"}
              footer={() => "*Legend stats based on KDN patch note"}
              size={"small"}
              dataSource={conversionDecalStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                defFlag: true,
                magdefFlag: true,
                defPercentFlag: true,
                magdefPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
          </div>
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
    const itemMats: CollapseProps["items"] = [
      {
        key: "1",
        label: "Armor",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement"}
                footer={() => "Using Armor Fragment"}
                size={"small"}
                dataSource={Object.entries({
                  "Buy from Store": CONV_FRAG,
                  "Every tap from +0 to +10": CONV_FRAG,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
              <Text>* +1 to +10 have 100% success rate</Text>
            </div>
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Evo Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": EV_AST_POW_ARMOR,
                  "Astral Stone": EV_AST_STONE,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": ENC_AST_POW_ARMOR,
                  "Astral Stone": ENC_AST_STONE_ARMOR,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
          </div>
        ),
      },
      {
        key: "2",
        label: "Weapon",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement"}
                footer={() => "Using Weapon Fragment"}
                size={"small"}
                dataSource={Object.entries({
                  "Every tap from +0 to +10": WEAP_FRAG,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
              <Text>
                * You can buy Conversion Weapon box via Trading House, or Cherry
                store
              </Text>
              {tempComp("Conversion Weapon", WEAP_ENH_SUC_RATE)}
            </div>
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Evo Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": EV_AST_POW_WEAP,
                  "Astral Stone": EV_AST_STONE,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
          </div>
        ),
      },
      {
        key: "3",
        label: "Accesories",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement"}
                footer={() => "Using Acc Fragment"}
                size={"small"}
                dataSource={Object.entries({
                  "Buy from Store": CONV_FRAG,
                  "Every tap from +0 to +10": CONV_FRAG,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
              <Text>* +1 to +10 have 100% success rate</Text>
            </div>
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Evo Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": EV_AST_POW_ACC,
                  "Astral Stone": EV_AST_STONE,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": ENC_AST_POW_ACC,
                  "Astral Stone": ENC_AST_STONE_ACC,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
          </div>
        ),
      },
      {
        key: "4",
        label: "WTD",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement"}
                footer={() => "Using Wtd Fragment"}
                size={"small"}
                dataSource={Object.entries({
                  "Buy from Store": CONV_FRAG,
                  "Every tap from +0 to +10": CONV_FRAG,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
              <Text>* +1 to +10 have 100% success rate</Text>
            </div>
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Evo Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": EV_AST_POW_WTD,
                  "Astral Stone": EV_AST_STONE,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
          </div>
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

export default ConversionContent;
