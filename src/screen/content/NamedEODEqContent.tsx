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
import {
  NamedEODMainStatTable,
  NamedEODMaterialTable,
  NamedEODSecondStatTable,
} from "../../data/NamedEODData";
import { NamedEODMaterial } from "../../interface/Item.interface";
import { NamedEODStat } from "../../interface/ItemStat.interface";

const { Text } = Typography;

interface TableResource {
  mats: string;
  amount: number;
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

  const columnsResource: ColumnsType<TableResource> = [
    { title: "Materials", dataIndex: "mats" },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 150,
    },
  ];

  const columnsMats: ColumnsType<NamedEODMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: (
        <div>
          <p>Guide Star</p>
          <p>Twilight Essence</p>
          <p>Gold</p>
        </div>
      ),
      responsive: ["xs"],
      render: (_, { guideStar, twilightEssence, gold }) => (
        <div>
          <p>{guideStar}(gs)</p>
          <p>{twilightEssence}(ess)</p>
          <p>{gold}(g)</p>
        </div>
      ),
    },
    {
      title: "Guide Star",
      dataIndex: "guideStar",
      responsive: ["sm"],
    },
    {
      title: "Twilight Essence",
      dataIndex: "twilightEssence",
      responsive: ["sm"],
    },
    {
      title: "Gold",
      dataIndex: "gold",
      responsive: ["sm"],
    },
  ];
  const columnsStats: ColumnsType<NamedEODStat> = [
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
        { minAttack, maxAttack, attackPercent, critical, criticalDamage }
      ) => (
        <div>
          <p>
            ATK {minAttack}-{maxAttack}
          </p>
          <p>ATK {attackPercent}%</p>
          <p>CRT {critical}</p>
          <p>CDM {criticalDamage}</p>
        </div>
      ),
    },
    {
      title: "Attack",
      responsive: ["sm"],
      render: (_, { minAttack, maxAttack }) => (
        <div>
          <Text>
            ATK {minAttack}-{maxAttack}
          </Text>
        </div>
      ),
    },
    {
      title: "Attack Percentage",
      responsive: ["sm"],
      render: (_, { attackPercent }) => (
        <div>
          <Text>ATK {attackPercent}%</Text>
        </div>
      ),
    },
    {
      title: "Critical",
      dataIndex: "critical",
      responsive: ["sm"],
    },
    {
      title: "Critical Damage",
      dataIndex: "criticalDamage",
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

  const getStatDiff = (arr: NamedEODStat[], min: number, max: number) => {
    const dt1 = arr.length > min ? arr[min] : undefined;
    const dt2 = arr.length > max ? arr[max] : undefined;
    if (!dt1 || !dt2) {
      return {
        encLevel: 0,
        minAttack: 0,
        maxAttack: 0,
        attackPercent: 0,
        critical: 0,
        criticalDamage: 0,
      };
    }
    return {
      encLevel: 0,
      minAttack: dt2.minAttack - dt1.minAttack,
      maxAttack: dt2.maxAttack - dt1.maxAttack,
      attackPercent: dt2.attackPercent - dt1.attackPercent,
      critical: dt2.critical - dt1.critical,
      criticalDamage: dt2.criticalDamage - dt1.criticalDamage,
    };
  };

  const statRange: NamedEODStat | undefined = useMemo(() => {
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
            onAfterChange={onAfterChange}
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
                      +ATK {statRange.minAttack}-{statRange.maxAttack}
                    </Text>
                    <Text>+ATK {statRange.attackPercent}%</Text>
                    <Text>+CRT {statRange.critical}</Text>
                    <Text>+CDM {statRange.criticalDamage}</Text>
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
