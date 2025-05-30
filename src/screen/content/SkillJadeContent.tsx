import {
  Alert,
  Card,
  Collapse,
  CollapseProps,
  Space,
  Table,
  Typography,
} from "antd";
import Slider, { SliderMarks } from "antd/es/slider";
import { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useMemo, useState } from "react";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import {
  AncientDJSkillMaterialTable,
  AncientDJSkillStatTable,
  DimensionalDJSkillMaterialTable,
  DimensionalDJSkillStatTable,
  DMFDJSkillMaterialTable,
  DMFDJSkillStatTable,
} from "../../data/SkillJadeData";
import { SkillJadeStat } from "../../interface/ItemStat.interface";
import { columnsResource } from "../../utils/common.util";

const { Text } = Typography;

interface DreamyTableMaterialList {
  "Dreamy Core": number;
  "High Purity Dreamy Core": number;
  Gold: number;
}

interface BloodMoonTableMaterialList {
  "Blood Moon Core": number;
  "High Purity Blood Moon Core": number;
  Gold: number;
}

interface VerdureTableMaterialList {
  "Verdure Core": number;
  "High Purity Verdure Core": number;
  Gold: number;
}

interface AncientTableMaterialList {
  "Ancient Broken Dragon Jade Fragments": number;
  "Ancient Dragon Jade Fragments": number;
  Gold: number;
}

interface DimensionalTableMaterialList {
  "Dimensional Core": number;
  "High Purity Dimensional Core": number;
  Gold: number;
}

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
  11: {
    style: { color: "#f50" },
    label: <strong>+11</strong>,
  },
  12: {
    style: { color: "#f50" },
    label: <strong>+12</strong>,
  },
  13: {
    style: { color: "#f50" },
    label: <strong>+13</strong>,
  },
  14: {
    style: { color: "#f50" },
    label: <strong>+14</strong>,
  },
  15: {
    style: { color: "#f50" },
    label: <strong>+15</strong>,
  },
};

const SkillJadeContent = () => {
  const [AncData, setAncData] = useState([0, 10]);
  const [DData, setDData] = useState([0, 10]);
  const [BMData, setBMData] = useState([0, 10]);
  const [VData, setVData] = useState([0, 10]);
  const [DmData, setDmData] = useState([0, 10]);

  const getStatDiff = (arr: SkillJadeStat[], min: number, max: number) => {
    const dt1 = arr.length > min ? arr[min] : undefined;
    const dt2 = arr.length > max ? arr[max] : undefined;
    if (!dt1 || !dt2) {
      return {
        encLevel: 0,
        attackPercent: 0,
        cooldownPercent: 0,
        successRate: 0,
      };
    }
    return {
      encLevel: 0,
      attackPercent: dt2.attackPercent - dt1.attackPercent,
      cooldownPercent: dt2.cooldownPercent - dt1.cooldownPercent,
      successRate: 0,
    };
  };
  const getChanceDiff = (
    arr: SkillJadeStat[],
    min: number,
    max: number
  ): number[] => {
    const dt1 = arr.length > min ? arr[min] : undefined;
    const dt2 = arr.length > max ? arr[max] : undefined;
    if (!dt1 || !dt2) {
      return [];
    }
    const temp: number[] = [];
    for (let a = Math.max(min + 1, 11); a <= max; a++) {
      temp.push(arr[a].successRate);
    }
    return temp;
  };

  const getColumnsStats = (showCd?: boolean): ColumnsType<SkillJadeStat> => {
    const cdData: ColumnsType<SkillJadeStat> = showCd
      ? [
          {
            title: "Cooldown Decrease",
            responsive: ["sm"],
            render: (_, { cooldownPercent }) => (
              <div>
                <Text>Cd -{cooldownPercent}%</Text>
              </div>
            ),
          },
        ]
      : [];
    const dt: ColumnsType<SkillJadeStat> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <Text>Attack Percentage</Text>
            {showCd && <Text>Cooldown Decrease</Text>}
            <Text>Success Rate</Text>
          </div>
        ),
        responsive: ["xs"],
        render: (_, { attackPercent, cooldownPercent, successRate }) => (
          <div>
            <p>ATK {attackPercent}%</p>
            {showCd && <p>Cd -{cooldownPercent}%</p>}
            <p>Success: {successRate}%</p>
          </div>
        ),
      },
      {
        title: "Attack Percentage",
        responsive: ["sm"],
        render: (_, { attackPercent }) => (
          <div>
            <Text style={{ margin: 0 }}>ATK {attackPercent}%</Text>
          </div>
        ),
      },
    ];

    const sRate: ColumnsType<SkillJadeStat> = [
      {
        title: "Success Rate",
        responsive: ["sm"],
        render: (_, { successRate }) => (
          <div>
            <Text style={{ margin: 0 }}>{successRate}%</Text>
          </div>
        ),
      },
    ];

    return [...dt, ...cdData, ...sRate];
  };

  const successComp = (arr: number[]) => {
    return arr.length > 0 ? (
      <>
        <Text>Succes rate from the smaller enhancement</Text>
        <Text>{arr.map((it) => `${it}%`).join(", ")}</Text>
      </>
    ) : (
      <></>
    );
  };

  const dDataSource: DreamyTableMaterialList = useMemo(() => {
    const tempSlice = DMFDJSkillMaterialTable.slice(DData[0], DData[1]);
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempHFrag += slicedItem.higherFragment;
      tempLFrag += slicedItem.lowerFragment;
      tempGold += slicedItem.gold;
    });
    const temp: DreamyTableMaterialList = {
      "Dreamy Core": tempLFrag,
      "High Purity Dreamy Core": tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [DData]);

  const showDWarning = useMemo(() => {
    return DData.some((dt) => dt > 10);
  }, [DData]);

  const statRangeD: SkillJadeStat = useMemo(() => {
    return getStatDiff(DMFDJSkillStatTable, DData[0], DData[1]);
  }, [DData]);
  const succRangeD = useMemo(() => {
    return getChanceDiff(DMFDJSkillStatTable, DData[0], DData[1]);
  }, [DData]);

  const getDCalc = () => {
    const onAfterChange = (value: number[]) => {
      setDData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={15}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          {showDWarning && (
            <div>
              <Alert
                banner
                message="From +11 onward, the enhancement might fail"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(dDataSource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {statRangeD && (
            <div>
              <Card size="small" style={{ marginTop: 4 }}>
                <Space direction="vertical">
                  <Text>ATK +{statRangeD.attackPercent}%</Text>
                  <Text>Cooldown Decrease {statRangeD.cooldownPercent}%</Text>
                  {successComp(succRangeD)}
                </Space>
              </Card>
            </div>
          )}
        </div>

        <TradingHouseCalc
          data={[
            {
              name: "Dreamy Core",
              amt: dDataSource["Dreamy Core"],
            },
            {
              name: "High Purity Dreamy Core",
              amt: dDataSource["High Purity Dreamy Core"],
              useCustomAmt: true,
            },
          ]}
          additionalTotal={dDataSource.Gold}
        />
      </div>
    );
  };

  const bmDataSource: BloodMoonTableMaterialList = useMemo(() => {
    const tempSlice = DMFDJSkillMaterialTable.slice(BMData[0], BMData[1]);
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempHFrag += slicedItem.higherFragment;
      tempLFrag += slicedItem.lowerFragment;
      tempGold += slicedItem.gold;
    });
    const temp: BloodMoonTableMaterialList = {
      "Blood Moon Core": tempLFrag,
      "High Purity Blood Moon Core": tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [BMData]);

  const showBMWarning = useMemo(() => {
    return BMData.some((dt) => dt > 10);
  }, [BMData]);

  const statRangeB: SkillJadeStat = useMemo(() => {
    return getStatDiff(DMFDJSkillStatTable, BMData[0], BMData[1]);
  }, [BMData]);
  const succRangeB = useMemo(() => {
    return getChanceDiff(DMFDJSkillStatTable, BMData[0], BMData[1]);
  }, [BMData]);

  const getBMCalc = () => {
    const onAfterChange = (value: number[]) => {
      setBMData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={15}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          {showBMWarning && (
            <div>
              <Alert
                banner
                message="From +11 onward, the enhancement might fail"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(bmDataSource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {statRangeB && (
            <div>
              <Card size="small" style={{ marginTop: 4 }}>
                <Space direction="vertical">
                  <Text>ATK +{statRangeB.attackPercent}%</Text>
                  <Text>Cooldown Decrease {statRangeB.cooldownPercent}%</Text>
                  {successComp(succRangeB)}
                </Space>
              </Card>
            </div>
          )}
        </div>

        <TradingHouseCalc
          data={[
            {
              name: "Blood Moon Core",
              amt: bmDataSource["Blood Moon Core"],
            },
            {
              name: "High Purity Blood Moon Core",
              amt: bmDataSource["High Purity Blood Moon Core"],
              useCustomAmt: true,
            },
          ]}
          additionalTotal={bmDataSource.Gold}
        />
      </div>
    );
  };

  const vDataSource: VerdureTableMaterialList = useMemo(() => {
    const tempSlice = DMFDJSkillMaterialTable.slice(VData[0], VData[1]);
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempHFrag += slicedItem.higherFragment;
      tempLFrag += slicedItem.lowerFragment;
      tempGold += slicedItem.gold;
    });
    const temp: VerdureTableMaterialList = {
      "Verdure Core": tempLFrag,
      "High Purity Verdure Core": tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [VData]);

  const showVWarning = useMemo(() => {
    return VData.some((dt) => dt > 10);
  }, [VData]);

  const statRangeV: SkillJadeStat = useMemo(() => {
    return getStatDiff(DMFDJSkillStatTable, VData[0], VData[1]);
  }, [VData]);
  const succRangeV = useMemo(() => {
    return getChanceDiff(DMFDJSkillStatTable, VData[0], VData[1]);
  }, [VData]);

  const getVCalc = () => {
    const onAfterChange = (value: number[]) => {
      setVData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={15}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          {showVWarning && (
            <div>
              <Alert
                banner
                message="From +11 onward, the enhancement might fail"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(vDataSource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {statRangeV && (
            <div>
              <Card size="small" style={{ marginTop: 4 }}>
                <Space direction="vertical">
                  <Text>ATK +{statRangeV.attackPercent}%</Text>
                  <Text>Cooldown Decrease {statRangeV.cooldownPercent}%</Text>
                  {successComp(succRangeV)}
                </Space>
              </Card>
            </div>
          )}
        </div>

        <TradingHouseCalc
          data={[
            {
              name: "Verdure Core",
              amt: vDataSource["Verdure Core"],
            },
            {
              name: "High Purity Verdure Core",
              amt: vDataSource["High Purity Verdure Core"],
              useCustomAmt: true,
            },
          ]}
          additionalTotal={vDataSource.Gold}
        />
      </div>
    );
  };

  const ancDataSource: AncientTableMaterialList = useMemo(() => {
    const tempSlice = AncientDJSkillMaterialTable.slice(AncData[0], AncData[1]);
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempHFrag += slicedItem.higherFragment;
      tempLFrag += slicedItem.lowerFragment;
      tempGold += slicedItem.gold;
    });
    const temp: AncientTableMaterialList = {
      "Ancient Broken Dragon Jade Fragments": tempLFrag,
      "Ancient Dragon Jade Fragments": tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [AncData]);

  const showAncWarning = useMemo(() => {
    return AncData.some((dt) => dt > 10);
  }, [AncData]);

  const statRangeA: SkillJadeStat = useMemo(() => {
    return getStatDiff(AncientDJSkillStatTable, AncData[0], AncData[1]);
  }, [AncData]);
  const succRangeA = useMemo(() => {
    return getChanceDiff(AncientDJSkillStatTable, AncData[0], AncData[1]);
  }, [AncData]);

  const getAncCalc = () => {
    const onAfterChange = (value: number[]) => {
      setAncData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={15}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          {showAncWarning && (
            <div>
              <Alert
                banner
                message="From +11 onward, the enhancement might fail"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(ancDataSource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {statRangeA && (
            <div>
              <Card size="small" style={{ marginTop: 4 }}>
                <Space direction="vertical">
                  <Text>ATK +{statRangeA.attackPercent}%</Text>
                  {successComp(succRangeA)}
                </Space>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  };

  const dmDataSource: DimensionalTableMaterialList = useMemo(() => {
    const tempSlice = DimensionalDJSkillMaterialTable.slice(
      DmData[0],
      DmData[1]
    );
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempHFrag += slicedItem.higherFragment;
      tempLFrag += slicedItem.lowerFragment;
      tempGold += slicedItem.gold;
    });
    const temp: DimensionalTableMaterialList = {
      "Dimensional Core": tempLFrag,
      "High Purity Dimensional Core": tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [DmData]);

  const showDmWarning = useMemo(() => {
    return DmData.some((dt) => dt > 10);
  }, [DmData]);

  const statRangeDm: SkillJadeStat = useMemo(() => {
    return getStatDiff(DimensionalDJSkillStatTable, DmData[0], DmData[1]);
  }, [DmData]);
  const succRangeDm = useMemo(() => {
    return getChanceDiff(DimensionalDJSkillStatTable, DmData[0], DmData[1]);
  }, [DmData]);

  const getDmCalc = () => {
    const onAfterChange = (value: number[]) => {
      setDmData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={15}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          {showDmWarning && (
            <div>
              <Alert
                banner
                message="From +11 onward, the enhancement might fail"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(dmDataSource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {statRangeDm && (
            <div>
              <Card size="small" style={{ marginTop: 4 }}>
                <Space direction="vertical">
                  <Text>ATK +{statRangeDm.attackPercent}%</Text>
                  <Text>Cooldown Decrease {statRangeDm.cooldownPercent}%</Text>
                  {successComp(succRangeDm)}
                </Space>
              </Card>
            </div>
          )}
        </div>

        <TradingHouseCalc
          data={[
            {
              name: "Dimensional Core",
              amt: dmDataSource["Dimensional Core"],
            },
            {
              name: "High Purity Dimensional Core",
              amt: dmDataSource["High Purity Dimensional Core"],
              useCustomAmt: true,
            },
          ]}
          additionalTotal={dmDataSource.Gold}
        />
      </div>
    );
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Skill Jade Stat Table",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>
              {"Dreamy / Blood Moon / Verdure Dragon Jade"}
            </Title>
            <Table
              size={"small"}
              dataSource={DMFDJSkillStatTable}
              columns={getColumnsStats(true)}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>{"Ancient Dragon Jade"}</Title>
            <Table
              size={"small"}
              dataSource={AncientDJSkillStatTable}
              columns={getColumnsStats()}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>{"Dimensional Dragon Jade"}</Title>
            <Table
              size={"small"}
              dataSource={DimensionalDJSkillStatTable}
              columns={getColumnsStats(true)}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Dreamy Dragon Jade",
      children: getDCalc(),
    },
    {
      key: "3",
      label: "Blood Moon Dragon Jade",
      children: getBMCalc(),
    },
    {
      key: "4",
      label: "Verdure Dragon Jade",
      children: getVCalc(),
    },
    {
      key: "5",
      label: "Ancient Dragon Jade",
      children: getAncCalc(),
    },
    {
      key: "6",
      label: "Dimensional Dragon Jade",
      children: getDmCalc(),
    },
  ];

  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["6"]} />
    </div>
  );
};

export default SkillJadeContent;
