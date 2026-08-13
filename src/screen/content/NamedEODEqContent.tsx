import {
  Card,
  Collapse,
  CollapseProps,
  Divider,
  Select,
  Slider,
  Space,
  Tooltip,
  Typography,
} from "antd";
import Checkbox, { CheckboxChangeEvent } from "antd/es/checkbox";
import { SliderMarks } from "antd/es/slider";
import Table, { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useMemo, useState } from "react";
import { makeCraftMaterialColumns } from "../../components/CraftMaterialColumns";
import {
  NamedEODMainStatTable,
  NamedEODMaterialTable,
  NamedEODSecondStatTable,
} from "../../data/NamedEODData";
import { NamedEODMaterial } from "../../interface/Item.interface";
import { CommonItemStats } from "../../interface/ItemStat.interface";
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
  0: "+0",
  1: "+1",
  2: "+2",
  3: "+3",
  4: "+4",
  5: "+5",
  6: "+6",
  7: "+7",
  8: "+8",
  9: "+9",
  10: "+10",
};

interface NamedEODTableMaterialList {
  "Guide Star": number;
  "Twilight Essence": number;
  Gold: number;
}

const NamedEODEqContent = () => {
  const [namedEODData, setNamedEODData] = useState([0, 5]);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [selectedStat, setSelectedStat] = useState(0);

  const columnsMats = makeCraftMaterialColumns<NamedEODMaterial>([
    { dataIndex: "guideStar", label: "Guide Star", shortLabel: "(gs)" },
    { dataIndex: "twilightEssence", label: "Twilight Essence", shortLabel: "(ess)" },
    { dataIndex: "gold", label: "Gold", shortLabel: "(g)" },
  ]);
  const columnsStats: ColumnsType<CommonItemStats> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: (
        <div>
          <p>Attack</p>
          <p>Attack Percentage</p>
          <p>Critical</p>
          <p>Critical Damage</p>
        </div>
      ),
      responsive: ["xs"],
      render: (
        _,
        { phyMagAtkMin, phyMagAtkMax, phyMagAtkPercent, crt, cdm }
      ) => (
        <div>
          <p>
            ATK {phyMagAtkMin}-{phyMagAtkMax}
          </p>
          <p>ATK {phyMagAtkPercent}%</p>
          <p>CRT {crt}</p>
          <p>CDM {cdm}</p>
        </div>
      ),
    },
    {
      title: "Attack",
      responsive: ["sm"],
      render: (_, { phyMagAtkMin, phyMagAtkMax }) => (
        <div>
          <Text>
            ATK {phyMagAtkMin}-{phyMagAtkMax}
          </Text>
        </div>
      ),
    },
    {
      title: "Attack Percentage",
      responsive: ["sm"],
      render: (_, { phyMagAtkPercent }) => (
        <div>
          <Text>ATK {phyMagAtkPercent}%</Text>
        </div>
      ),
    },
    {
      title: "Critical",
      dataIndex: "crt",
      responsive: ["sm"],
    },
    {
      title: "Critical Damage",
      dataIndex: "cdm",
      responsive: ["sm"],
    },
  ];

  const ancDataSource: NamedEODTableMaterialList = useMemo(() => {
    const tempSlice = NamedEODMaterialTable.slice(
      namedEODData[0],
      namedEODData[1]
    );
    let tempGS = 0;
    let tempEss = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempGS += slicedItem.guideStar;
      tempEss += slicedItem.twilightEssence;
      tempGold += slicedItem.gold;
    });
    if (checkedCraft) {
      tempGS += 10;
      tempEss += 80;
      tempGold += 25;
    }
    const temp: NamedEODTableMaterialList = {
      "Guide Star": tempGS,
      "Twilight Essence": tempEss,
      Gold: tempGold,
    };
    return temp;
  }, [namedEODData, checkedCraft]);

  const getStatDiff = (
    arr: CommonItemStats[],
    min: number,
    max: number
  ): CommonItemStats => {
    const dt1 = arr.length > min ? arr[min] : undefined;
    const dt2 = arr.length > max ? arr[max] : undefined;
    if (!dt1 || !dt2) {
      return {
        encLevel: "0",
        phyMagAtkMin: 0,
        phyMagAtkMax: 0,
        phyMagAtkPercent: 0,
        crt: 0,
        cdm: 0,
      };
    }
    return {
      encLevel: "0",
      phyMagAtkMin: (dt2.phyMagAtkMin ?? 0) - (dt1.phyMagAtkMin ?? 0),
      phyMagAtkMax: (dt2.phyMagAtkMax ?? 0) - (dt1.phyMagAtkMax ?? 0),
      phyMagAtkPercent:
        (dt2.phyMagAtkPercent ?? 0) - (dt1.phyMagAtkPercent ?? 0),
      crt: (dt2.crt ?? 0) - (dt1.crt ?? 0),
      cdm: (dt2.cdm ?? 0) - (dt1.cdm ?? 0),
    };
  };

  const statRange: CommonItemStats | undefined = useMemo(() => {
    if (selectedStat === 1) {
      return getStatDiff(
        NamedEODMainStatTable,
        namedEODData[0],
        namedEODData[1]
      );
    } else if (selectedStat === 2) {
      return getStatDiff(
        NamedEODSecondStatTable,
        namedEODData[0],
        namedEODData[1]
      );
    }
    return;
  }, [selectedStat, namedEODData]);

  const onChangeCraft = (e: CheckboxChangeEvent) => {
    setCheckedCraft(e.target.checked);
  };

  const getCalc = () => {
    const onAfterChange = (value: number[]) => {
      setNamedEODData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 5]}
            max={10}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          <Divider orientation="left">Settings</Divider>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox checked={checkedCraft} onChange={onChangeCraft}>
              <Tooltip
                title="10 guide star, 80 Twilight Essence, 25 gold"
                trigger="hover"
                color="blue"
                placement="right"
              >
                Include Craft Mats
              </Tooltip>
            </Checkbox>
          </div>

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

          <Divider orientation="left">Stat Increase</Divider>
          <Select
            defaultValue={selectedStat}
            style={{ width: 120 }}
            onChange={(val) => {
              setSelectedStat(val);
            }}
            options={[
              { value: 0, label: "Select" },
              { value: 1, label: "Main" },
              { value: 2, label: "Second" },
            ]}
          />
          <div style={{ marginBottom: 4 }}>
            {statRange && (
              <div>
                <Card size="small" style={{ marginTop: 4 }}>
                  <Space direction="vertical">
                    <Text>
                      +ATK {statRange.phyMagAtkMin}-{statRange.phyMagAtkMax}
                    </Text>
                    <Text>+ATK {statRange.phyMagAtkPercent}%</Text>
                    <Text>+CRT {statRange.crt}</Text>
                    <Text>+CDM {statRange.cdm}</Text>
                  </Space>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Named End of Dream Craft Table",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={NamedEODMaterialTable}
              columns={columnsMats}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Named End of Dream Stat Table",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>{"Main Weapon"}</Title>
            <Table
              size={"small"}
              dataSource={NamedEODMainStatTable}
              columns={columnsStats}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>{"Second Weapon"}</Title>
            <Table
              size={"small"}
              dataSource={NamedEODSecondStatTable}
              columns={columnsStats}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Named End of Dream Calculator",
      children: getCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default NamedEODEqContent;
