import {
  Card,
  Checkbox,
  Collapse,
  CollapseProps,
  Divider,
  InputNumber,
  Slider,
  Space,
  Typography,
} from "antd";
import { SliderMarks } from "antd/es/slider";
import Table, { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import TradingHouseCalc, {
  CalcDataMapped,
} from "../../components/TradingHouseCalc";
import {
  AncientGoddesHeraDisassemblyItemTable,
  AncientGoddesHeraRequiredItemTable,
  AncientGoddesHeraStatTable,
} from "../../data/AncientsGoddessHeraData";
import {
  AncientGoddesHeraDisassemblyItem,
  AncientGoddesHeraRequiredItem,
} from "../../interface/Item.interface";
import { AncientGoddesHeraStat } from "../../interface/ItemStat.interface";
import { columnsResource } from "../../utils/common.util";

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
  0: "Don't have",
  5: "lv.5",
  10: "lv.10",
};

interface AncientGoddessHeraTableMaterialList {
  "Ancients' Blueprint Fragment": number;
  "Ancients' Blueprint": number;
  Gold: number;
}
interface BuyMaterialList {
  matsPercent: number;
  msgTotal: string;
  converterGold: number;
}

const AncientHeraldryContent = () => {
  const [heraldryData, setHeraldryData] = useState([0, 10]);
  const [convertToFrag, setConvertToFrag] = useState<boolean>(false);
  const [dt, setDt] = useState<CalcDataMapped[]>([]);
  const [invenAB, setinvenAB] = useState<number>(0);
  const [invenABF, setinvenABF] = useState<number>(0);

  const columnsRequired: ColumnsType<AncientGoddesHeraRequiredItem> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: (
        <div>
          <p>Ancients' Blueprint</p>
          <p>Ancients' Blueprint Fragment</p>
        </div>
      ),
      responsive: ["xs"],
      render: (_, { ab, abFrag }) => (
        <div>
          <p>{ab}</p>
          <p>{abFrag}</p>
        </div>
      ),
    },
    {
      title: "Ancients' Blueprint",
      dataIndex: "ab",
      responsive: ["sm"],
      render: (_, { ab }) => <Text>{ab.toLocaleString()}</Text>,
    },
    {
      title: "Ancients' Blueprint Fragment",
      dataIndex: "abFrag",
      responsive: ["sm"],
      render: (_, { abFrag }) => <Text>{abFrag.toLocaleString()}</Text>,
    },
  ];

  const columnsDisassembly: ColumnsType<AncientGoddesHeraDisassemblyItem> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: "Ancients' Blueprint Fragment",
      dataIndex: "abFrag",
      render: (_, { abFrag }) => <Text>{abFrag.toLocaleString()}</Text>,
    },
  ];
  const columnsStat: ColumnsType<AncientGoddesHeraStat> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: "Skill Stats",
      render: (_, { attackPercent }) => (
        <div>
          <Text style={{ margin: 0 }}>{attackPercent}%</Text>
        </div>
      ),
    },
  ];

  const ancDataSource: AncientGoddessHeraTableMaterialList = useMemo(() => {
    const from = heraldryData[0];
    const to = heraldryData[1];
    const fromMats = AncientGoddesHeraRequiredItemTable[from];
    const toMats = AncientGoddesHeraRequiredItemTable[to];
    let tempABF = toMats.abFrag - fromMats.abFrag;
    let tempAB = toMats.ab - fromMats.ab;
    let tempGold = 0;

    if (to > 5 && from < 6) {
      tempAB += tempABF / 10;
      tempABF = 0;
      tempGold = (fromMats.abFrag / 10) * 500;
    }
    if (convertToFrag) {
      tempABF += tempAB * 10;
      tempAB = 0;
      tempGold = toMats.ab * 500;
    }
    const temp: AncientGoddessHeraTableMaterialList = {
      "Ancients' Blueprint Fragment": tempABF,
      "Ancients' Blueprint": tempAB,
      Gold: tempGold,
    };
    return temp;
  }, [heraldryData, convertToFrag]);

  const progressDataSource: BuyMaterialList = useMemo(() => {
    const from = heraldryData[0];
    const to = heraldryData[1];
    const fromMats = AncientGoddesHeraRequiredItemTable[from];
    const toMats = AncientGoddesHeraRequiredItemTable[to];
    let tempGold = 0;
    let tempPercent = 0;
    let tempTotalAB = invenAB;
    let tempMsg = "";
    const foundAB = dt.find((it) => it.name === "Blueprint");
    const foundABF = dt.find((it) => it.name === "Blueprint Frag");

    const convertABFtoAB = (abFag: number) => {
      const tempAB = Math.trunc(abFag / 10);
      tempTotalAB += tempAB;
      tempGold += tempAB * 500;
    };

    if (toMats.encLevel > 5) {
      if (fromMats.encLevel <= 5) {
        convertABFtoAB(fromMats.abFrag);
      } else {
        convertABFtoAB(fromMats.ab * 10);
      }

      convertABFtoAB(invenABF);

      if (foundABF) {
        convertABFtoAB(foundABF.customAmt);
      }
      if (foundAB) {
        const a = Math.trunc(
          ((tempTotalAB + foundAB.customAmt) * 100) / toMats.ab
        );
        tempMsg = `AB Collected: ${tempTotalAB + foundAB.customAmt} / ${
          toMats.ab
        }`;
        tempPercent = Math.min(a, 100);
      }
    } else if (toMats.encLevel <= 5) {
      if (foundABF) {
        const total = fromMats.abFrag + foundABF.customAmt + invenABF;
        const a = Math.trunc((total * 100) / toMats.abFrag);
        tempMsg = `ABF Collected: ${total} / ${toMats.abFrag}`;
        tempPercent = Math.min(a, 100);
      }
    }

    const temp: BuyMaterialList = {
      matsPercent: tempPercent,
      converterGold: tempGold,
      msgTotal: tempMsg,
    };
    return temp;
  }, [dt, heraldryData, invenAB, invenABF]);

  const progressData = useMemo(() => {
    const fromMats = AncientGoddesHeraRequiredItemTable[heraldryData[0]];
    const toMats = AncientGoddesHeraRequiredItemTable[heraldryData[1]];
    if (toMats.encLevel <= 5) {
      return [
        {
          name: "Blueprint Frag",
          amt: fromMats.abFrag,
          useCustomAmt: true,
        },
      ];
    }
    return [
      {
        name: "Blueprint",
        amt: fromMats.ab,
        useCustomAmt: true,
      },
      {
        name: "Blueprint Frag",
        amt: fromMats.abFrag,
        useCustomAmt: true,
      },
    ];
  }, [heraldryData]);

  const additionalData = useMemo(() => {
    const fromMats = AncientGoddesHeraRequiredItemTable[heraldryData[0]];
    return (
      <Space direction="vertical">
        <Text>{progressDataSource.msgTotal}</Text>
        {fromMats.ab !== 0 && <Text>AB Recovered: {fromMats.ab}</Text>}
        {fromMats.abFrag !== 0 && <Text>ABF Recovered: {fromMats.abFrag}</Text>}
        {progressDataSource.converterGold !== 0 && (
          <Text>
            Gold to convert ABF to AB: {progressDataSource.converterGold}
          </Text>
        )}

        <Text>
          AB in inventory
          <InputNumber
            min={0}
            value={invenAB}
            onChange={(val) => {
              setinvenAB(val ?? 0);
            }}
            size="middle"
            style={{ width: 120, marginLeft: 4 }}
          />
        </Text>
        <Text>
          ABF in inventory
          <InputNumber
            min={0}
            value={invenABF}
            onChange={(val) => {
              setinvenABF(val ?? 0);
            }}
            size="middle"
            style={{ width: 120, marginLeft: 4 }}
          />
        </Text>
        <Text>Buy in TH:</Text>
      </Space>
    );
  }, [heraldryData, progressDataSource, invenAB, invenABF]);

  const statRange = useMemo(() => {
    const from = heraldryData[0];
    const to = heraldryData[1];
    const fromStats = AncientGoddesHeraStatTable[from];
    const toStats = AncientGoddesHeraStatTable[to];
    return toStats.attackPercent - fromStats.attackPercent;
  }, [heraldryData]);

  const getCalc = () => {
    const onAfterChange = (value: number[]) => {
      setHeraldryData(value);
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
        <div>
          <Divider orientation="left">Material List</Divider>
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
          <div>
            <Card size="small" style={{ marginTop: 4, marginBottom: 4 }}>
              <Space direction="vertical">
                <Text>Hero Skill +{statRange}%</Text>
              </Space>
            </Card>
          </div>

          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox
              checked={convertToFrag}
              onChange={(e) => {
                setConvertToFrag(e.target.checked);
              }}
            >
              Change Blueprint to Fragment
            </Checkbox>
          </div>
        </div>
        <TradingHouseCalc
          customTitle="My Progress"
          data={progressData}
          additionalTotal={progressDataSource.converterGold}
          showProgress
          disableFilter
          progressPercent={progressDataSource.matsPercent}
          copyFn={setDt}
          additionalHeaderItem={additionalData}
        />
      </div>
    );
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Ancients' Goddess Heraldry Required Item Table",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={AncientGoddesHeraRequiredItemTable}
              columns={columnsRequired}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Ancients' Goddess Heraldry Disassembly Table",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={AncientGoddesHeraDisassemblyItemTable}
              columns={columnsDisassembly}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Ancients' Goddess Heraldry Status Table",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={AncientGoddesHeraStatTable}
              columns={columnsStat}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "4",
      label: "Ancients' Goddess Heraldry Calculator",
      children: getCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["4"]} />
    </div>
  );
};

export default AncientHeraldryContent;
