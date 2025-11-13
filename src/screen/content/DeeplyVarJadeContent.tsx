import {
  Card,
  Collapse,
  CollapseProps,
  Divider,
  Grid,
  Select,
  Slider,
  Tooltip,
  Typography,
} from "antd";
import Checkbox, { CheckboxChangeEvent } from "antd/es/checkbox";
import { SliderMarks } from "antd/es/slider";
import Table, { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { DeeplyVariantJadeEnhanceMaterial } from "../../interface/Item.interface";
import {
  columnsResource,
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
  getSuccessRateTag,
  getTextEmpty,
} from "../../utils/common.util";
import {
  DeeplyVariantLJadeEnhanceMaterialTable,
  DeeplyVariantLJadeStatsTable,
  DeeplyVariantUJadeEnhanceMaterialTable,
  DeeplyVariantUJadeStatsTable,
} from "../../data/DeeplyVarJadeData";
import ListingCard, { ItemList } from "../../components/ListingCard";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import { EmptyCommonnStat } from "../../constants/Common.constants";
const { Text } = Typography;
const { useBreakpoint } = Grid;

const style: React.CSSProperties = {
  display: "inline-block",
  height: 300,
  marginLeft: 20,
  marginRight: 50,
  marginTop: 10,
  marginBottom: 30,
};

const marks: SliderMarks = {
  0: "+0",
  5: "+5",
  10: "+10",
};

interface DeeplyVariantTableMaterialList {
  "Collapse Dimension Energy": number;
  "Deeply Rooted Fragment of Longing": number;
  "Twisted Root": number;
  Gold: number;
  "Contaminated Will": number;
  "Corrupted Origin": number;
}

interface ExtraData {
  enhance: string;
  sRate: string;
}

const DeeplyVarJadeContent = () => {
  const screens = useBreakpoint();
  const [deepData, setDeepData] = useState([0, 10]);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [checkedEvoL, setCheckedEvoL] = useState(false);
  const [checkedEvoA, setCheckedEvoA] = useState(false);
  const [selectStart, setSelectStart] = useState<number>(0);
  const [selectEnd, setSelectEnd] = useState<number>(1);

  const enhanceList = useMemo(() => {
    return Array.from({ length: 51 }, (_, k) => k).map((item) => ({
      label: `+${item}`,
      value: item,
    }));
  }, []);

  const getWidthSetting = () => {
    if (screens.xs) {
      return 200;
    }
    return 350;
  };

  const getColumnsMats = (
    isLJade?: boolean
  ): ColumnsType<DeeplyVariantJadeEnhanceMaterial> => {
    return [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Deeply Rooted Fragment of Longing</p>
            {isLJade && <p>Twisted Root</p>}
            <p>Gold</p>
            {isLJade && <p>Success Rate</p>}
          </div>
        ),
        responsive: ["xs"],
        render: (
          _,
          { deepRootedLonging, twistedRoot, gold, successRatePercent }
        ) => (
          <div>
            <p>{deepRootedLonging}(Fragment)</p>
            {isLJade && <p>{twistedRoot}(Root)</p>}
            <p>{getTextEmpty({ txt: gold })}(g)</p>
            {isLJade && (
              <p>
                {getTextEmpty({ txt: successRatePercent, tailText: "%" })}
                (Success%)
              </p>
            )}
          </div>
        ),
      },
      {
        title: "Deeply Rooted Fragment of Longing",
        dataIndex: "deepRootedLonging",
        responsive: ["sm"],
      },
      ...(isLJade
        ? ([
            {
              title: "Twisted Root",
              dataIndex: "twistedRoot",
              responsive: ["sm"],
            },
          ] as ColumnsType<DeeplyVariantJadeEnhanceMaterial>)
        : []),
      {
        title: "Gold",
        dataIndex: "gold",
        width: 100,
        responsive: ["sm"],
        render: (_, { gold }) => (
          <div>
            <Text>{getTextEmpty({ txt: gold })}</Text>
          </div>
        ),
      },
      ...(isLJade
        ? ([
            {
              title: "Success Rate",
              responsive: ["sm"],
              render: (_, { successRatePercent }) => (
                <Text>
                  {getTextEmpty({
                    txt: successRatePercent,
                    tailText: "%",
                  })}
                </Text>
              ),
            },
          ] as ColumnsType<DeeplyVariantJadeEnhanceMaterial>)
        : []),
    ];
  };

  const encUDataSource: DeeplyVariantTableMaterialList = useMemo(() => {
    const tempSlice = DeeplyVariantUJadeEnhanceMaterialTable.slice(
      deepData[0],
      deepData[1]
    );
    let tempEnergy = 0;
    let tempDeepFrag = 0;
    let tempGold = 0;
    let tempWill = 0;
    let tempOri = 0;

    tempSlice.forEach((slicedItem) => {
      tempDeepFrag += slicedItem.deepRootedLonging;
      tempGold += slicedItem.gold;
    });
    if (checkedCraft) {
      tempDeepFrag += 200;
      tempEnergy += 2;
    }
    if (checkedEvoL) {
      tempWill += 1;
    }
    if (checkedEvoA) {
      tempOri += 1;
    }
    const temp: DeeplyVariantTableMaterialList = {
      "Collapse Dimension Energy": tempEnergy,
      "Deeply Rooted Fragment of Longing": tempDeepFrag,
      "Twisted Root": 0,
      Gold: tempGold,
      "Contaminated Will": tempWill,
      "Corrupted Origin": tempOri,
    };
    return temp;
  }, [deepData, checkedCraft, checkedEvoL, checkedEvoA]);

  const onChangeCraft = (e: CheckboxChangeEvent) => {
    setCheckedCraft(e.target.checked);
  };
  const onChangeEvoL = (e: CheckboxChangeEvent) => {
    setCheckedEvoL(e.target.checked);
  };
  const onChangeEvoA = (e: CheckboxChangeEvent) => {
    setCheckedEvoA(e.target.checked);
  };

  const uStatDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    let tableHolder = DeeplyVariantUJadeStatsTable;

    const { dt1, dt2 } = getComparedData(
      tableHolder,
      deepData[0] + 1,
      deepData[1] + 1
    );
    if (dt2) {
      if (checkedCraft) {
        temp = dt2;
      } else {
        const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
        temp = combineEqStats(temp, dt, "add");
      }
    }
    if (checkedEvoL || checkedEvoA) {
      temp = { ...temp, attAtkPercent: 5 };
    }
    return temp;
  }, [checkedCraft, checkedEvoL, checkedEvoA, deepData]);

  const getCalc = () => {
    const onAfterChange = (value: number[]) => {
      setDeepData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={10}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Divider orientation="left">Settings</Divider>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox checked={checkedCraft} onChange={onChangeCraft}>
              <Tooltip
                title="200 deep fragment longing, 2 collapse Dim.Energy"
                trigger="hover"
                color="blue"
                placement="right"
              >
                Include craft mats
              </Tooltip>
            </Checkbox>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox checked={checkedEvoL} onChange={onChangeEvoL}>
              <Tooltip
                title="1 Contaminated Will"
                trigger="hover"
                color="blue"
                placement="right"
              >
                Include Legend evolver
              </Tooltip>
            </Checkbox>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox checked={checkedEvoA} onChange={onChangeEvoA}>
              <Tooltip
                title="1 Corrupted Origin"
                trigger="hover"
                color="blue"
                placement="right"
              >
                Include Ancient evolver
              </Tooltip>
            </Checkbox>
          </div>
          <Divider orientation="left">Material List</Divider>
          <Table
            size={"small"}
            dataSource={Object.entries(encUDataSource)
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
          <ListingCard title="Status Increase" data={getStatDif(uStatDif)} />
          {checkedEvoL && (
            <Card
              size={"small"}
              style={{ maxWidth: getWidthSetting(), marginTop: 4 }}
            >
              <Text>
                *1 Skill ATK up Add on Stats [cm3/ ult/ 50 spec/ secondary/
                main] +50%
              </Text>
            </Card>
          )}
          {checkedEvoA && (
            <Card
              size={"small"}
              style={{ maxWidth: getWidthSetting(), marginTop: 4 }}
            >
              <Text>
                *3 Critical hit additional damage Add on Stats [cm3/ ult/ 50
                spec/ secondary/ main] from [all class] with [1/3/5/7/10]%
              </Text>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const getLStats = () => {
    const col = getColumnsStats({
      phyMagAtkFlag: true,
      cdmFlag: true,
      fdFlag: true,
      hpFlag: true,
      attAtkPercentFlag: true,
    });
    const its: CollapseProps["items"] = [];
    for (let i = 0; i < 5; i++) {
      const start = i * 10;
      const end = (i + 1) * 10;
      its.push({
        key: `${start + 1}`,
        label: `${start + 1}-${end}`,
        children: (
          <Table
            size={"small"}
            dataSource={DeeplyVariantLJadeStatsTable.slice(start, end)}
            columns={col}
            pagination={false}
            bordered
          />
        ),
      });
    }
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Collapse items={its} size="small" />
      </div>
    );
  };

  const getLMats = () => {
    const col = getColumnsMats(true);
    const its: CollapseProps["items"] = [];
    for (let i = 0; i < 5; i++) {
      const start = i * 10;
      const end = (i + 1) * 10;
      its.push({
        key: `${start + 1}`,
        label: `${start + 1}-${end}`,
        children: (
          <Table
            size={"small"}
            dataSource={DeeplyVariantLJadeEnhanceMaterialTable.slice(
              start,
              end
            )}
            columns={col}
            pagination={false}
            bordered
          />
        ),
      });
    }
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Collapse items={its} size="small" />
      </div>
    );
  };

  const isError = useMemo(() => {
    if (selectStart === undefined || selectEnd === undefined) {
      return true;
    }
    return selectStart >= selectEnd;
  }, [selectStart, selectEnd]);

  const encLDataSource: {
    res1: DeeplyVariantTableMaterialList;
    res2: Array<ExtraData>;
  } = useMemo(() => {
    let temp: DeeplyVariantTableMaterialList = {
      "Collapse Dimension Energy": 0,
      "Deeply Rooted Fragment of Longing": 0,
      "Twisted Root": 0,
      Gold: 0,
      "Contaminated Will": 0,
      "Corrupted Origin": 0,
    };
    let exData: ExtraData[] = [];
    if (!isError) {
      let tempDeepFrag = 0;
      let tempTwist = 0;
      let tempGold = 0;
      const tempSlice = DeeplyVariantLJadeEnhanceMaterialTable.slice(
        selectStart,
        selectEnd
      );
      tempSlice.forEach((slicedItem) => {
        tempDeepFrag += slicedItem.deepRootedLonging;
        tempTwist += slicedItem.twistedRoot ?? 0;
        tempGold += slicedItem.gold;
        if (slicedItem.successRatePercent !== 100) {
          exData.push({
            enhance: `${slicedItem.encLevel}`,
            sRate: `${slicedItem.successRatePercent}%`,
          });
        }
      });
      temp["Deeply Rooted Fragment of Longing"] = tempDeepFrag;
      temp["Twisted Root"] = tempTwist;
      temp.Gold = tempGold;
    }
    return { res1: temp, res2: exData };
  }, [isError, selectStart, selectEnd]);

  const extraInfo: ItemList[] = useMemo(() => {
    const list: ItemList[] = [];
    list.push({
      title: "Summary ",
      isHeader: true,
      removeWidth: true,
      children: getSuccessRateTag("sRate", [
        encLDataSource.res2.length !== 0 ? 0 : 100,
      ]),
    });
    if (encLDataSource.res2.length !== 0) {
      encLDataSource.res2.forEach((it) => {
        list.push({
          title: `enhancing to +${it.enhance} have`,
          value: `${it.sRate} success rate`,
        });
      });
    }
    return list;
  }, [encLDataSource.res2]);

  const lStatDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    let tableHolder = [
      {
        ...DeeplyVariantUJadeStatsTable[10],
        attAtkPercent: 5,
      } as CommonItemStats,
    ].concat(DeeplyVariantLJadeStatsTable);

    if (!isError && selectStart !== undefined && selectEnd !== undefined) {
      const { dt1, dt2 } = getComparedData(
        tableHolder,
        selectStart + 1,
        selectEnd + 1
      );
      if (dt2) {
        if (checkedCraft) {
          temp = dt2;
        } else {
          const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
          temp = combineEqStats(temp, dt, "add");
        }
      }
    }

    return temp;
  }, [checkedCraft, isError, selectStart, selectEnd]);

  const getLCalc = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Divider orientation="left">Enhance</Divider>
          <div style={{ marginBottom: 4, color: isError ? "red" : "unset" }}>
            Enhance
            <Divider type="vertical" />
            <Select
              value={selectStart}
              style={{ width: 100, marginBottom: 4 }}
              onChange={(val) => {
                setSelectStart(val);
              }}
              options={enhanceList}
            />
            {` - `}
            <Select
              value={selectEnd}
              style={{ width: 100, marginBottom: 4 }}
              onChange={(val) => {
                setSelectEnd(val);
              }}
              options={enhanceList}
            />
          </div>
        </div>

        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Divider orientation="left">Material List</Divider>
          <Table
            size={"small"}
            dataSource={Object.entries(encLDataSource.res1)
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
          <ListingCard keyId="extra-info" title="Extra Info" data={extraInfo} />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <ListingCard title="Status Increase" data={getStatDif(lStatDif)} />
        </div>
      </div>
    );
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats - Unique Grade",
      children: (
        <Table
          style={{ marginRight: 10, marginBottom: 10 }}
          size={"small"}
          dataSource={DeeplyVariantUJadeStatsTable}
          columns={getColumnsStats({
            phyMagAtkFlag: true,
            cdmFlag: true,
            fdFlag: true,
            hpFlag: true,
            attAtkPercentFlag: true,
          })}
          pagination={false}
          bordered
        />
      ),
    },
    {
      key: "2",
      label: "Mats - Unique Grade",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={DeeplyVariantUJadeEnhanceMaterialTable}
              columns={getColumnsMats()}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Calculate - Unique Grade",
      children: getCalc(),
    },
    {
      key: "4",
      label: "Stats - Legend / Ancient Grade",
      children: getLStats(),
    },
    {
      key: "5",
      label: "Mats - Legend / Ancient Grade",
      children: getLMats(),
    },
    {
      key: "6",
      label: "Calculate - Legend / Ancient Grade",
      children: getLCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3", "6"]} />
    </div>
  );
};

export default DeeplyVarJadeContent;
