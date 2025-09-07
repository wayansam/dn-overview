import { Alert, Card, Slider, Space, Table, Typography } from "antd";
import { SliderMarks } from "antd/es/slider";
import { useMemo, useState } from "react";
import { SkillJadeEnhanceMaterial } from "../interface/Item.interface";
import { SkillJadeStat } from "../interface/ItemStat.interface";
import { columnsResource } from "../utils/common.util";
import TradingHouseCalc from "./TradingHouseCalc";

const { Text } = Typography;

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

interface SkillJadeCalcCompProps {
  matsTable: SkillJadeEnhanceMaterial[];
  statsTable: SkillJadeStat[];
  lFragName: string;
  hFragName: string;
  hideCD?: boolean;
  hideTH?: boolean;
}

const SkillJadeCalcComp = ({
  matsTable,
  statsTable,
  lFragName,
  hFragName,
  hideCD,
  hideTH,
}: SkillJadeCalcCompProps) => {
  const [data, setData] = useState([0, 10]);

  const showWarning = useMemo(() => {
    return data.some((dt) => dt > 10);
  }, [data]);

  interface TableMaterialList {
    lFragName: number;
    hFragName: number;
    Gold: number;
  }

  const dataSource: TableMaterialList = useMemo(() => {
    const tempSlice = matsTable.slice(data[0], data[1]);
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempHFrag += slicedItem.higherFragment;
      tempLFrag += slicedItem.lowerFragment;
      tempGold += slicedItem.gold;
    });
    const temp: TableMaterialList = {
      lFragName: tempLFrag,
      hFragName: tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [data]);

  const statRange: SkillJadeStat = useMemo(() => {
    return getStatDiff(statsTable, data[0], data[1]);
  }, [data]);

  const succRange = useMemo(() => {
    return getChanceDiff(statsTable, data[0], data[1]);
  }, [data]);

  const onAfterChange = (value: number[]) => {
    setData(value);
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
  const getKeyName = (s: string) => {
    switch (s) {
      case "lFragName":
        return lFragName;
      case "hFragName":
        return hFragName;
      default:
        return s;
    }
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
        {showWarning && (
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
          dataSource={Object.entries(dataSource).map(([key, value]) => ({
            mats: getKeyName(key),
            amount: value,
          }))}
          columns={columnsResource}
          pagination={false}
          bordered
        />
        {statRange && (
          <div>
            <Card size="small" style={{ marginTop: 4 }}>
              <Space direction="vertical">
                <Text>ATK +{statRange.attackPercent}%</Text>
                {!hideCD && (
                  <Text>Cooldown Decrease {statRange.cooldownPercent}%</Text>
                )}
                {successComp(succRange)}
              </Space>
            </Card>
          </div>
        )}
      </div>

      {!hideTH && (
        <TradingHouseCalc
          data={[
            {
              name: lFragName,
              amt: dataSource.lFragName,
            },
            {
              name: hFragName,
              amt: dataSource.hFragName,
              useCustomAmt: true,
            },
          ]}
          additionalTotal={dataSource.Gold}
        />
      )}
    </div>
  );
};

export default SkillJadeCalcComp;
