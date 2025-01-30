import { Collapse, CollapseProps, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  EternalChaosTalismanStatTable,
  EternalPainTalismanStatTable,
  EternalWorldTalismanStatTable,
} from "../../data/EternalTalismanData";
import {
  EternalChaosTalismanStat,
  EternalPainTalismanStat,
  EternalWorldTalismanStat,
} from "../../interface/ItemStat.interface";
import { getTextEmpty } from "../../utils/common.util";
const { Text } = Typography;

const ExternalTalismanContent = () => {
  const getStatContent = () => {
    const columnsWorldMats: ColumnsType<EternalWorldTalismanStat> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Attack</p>
            <p>Attribute ATK(%)</p>
            <p>MAX HP</p>
          </div>
        ),
        responsive: ["xs"],
        render: (_, { attack, attributePercent, maxHP }) => (
          <div>
            <p>ATT {attack.toLocaleString()}</p>
            <p>
              Attribute(%){" "}
              {getTextEmpty({ txt: attributePercent, tailText: "%" })}
            </p>
            <p>HP {maxHP.toLocaleString()}</p>
          </div>
        ),
      },
      {
        title: "Attack",
        responsive: ["sm"],
        render: (_, { attack }) => <Text>{attack.toLocaleString()}</Text>,
      },
      {
        title: "Attribute ATK(%)",
        responsive: ["sm"],
        render: (_, { attributePercent }) => (
          <Text>{getTextEmpty({ txt: attributePercent, tailText: "%" })}</Text>
        ),
      },
      {
        title: "MAX HP",
        responsive: ["sm"],
        render: (_, { maxHP }) => <Text>{maxHP.toLocaleString()}</Text>,
      },
    ];

    const columnsPainMats: ColumnsType<EternalPainTalismanStat> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Attack</p>
            <p>Final Damage</p>
            <p>MAX HP</p>
          </div>
        ),
        responsive: ["xs"],
        render: (_, { attack, fd, maxHP }) => (
          <div>
            <p>ATT {attack.toLocaleString()}</p>
            <p>FD {fd.toLocaleString()}</p>
            <p>HP {maxHP.toLocaleString()}</p>
          </div>
        ),
      },
      {
        title: "Attack",
        responsive: ["sm"],
        render: (_, { attack }) => <Text>{attack.toLocaleString()}</Text>,
      },
      {
        title: "Final Damage",
        responsive: ["sm"],
        render: (_, { fd }) => <Text>{fd.toLocaleString()}</Text>,
      },
      {
        title: "MAX HP",
        responsive: ["sm"],
        render: (_, { maxHP }) => <Text>{maxHP.toLocaleString()}</Text>,
      },
    ];

    const columnsChaosMats: ColumnsType<EternalChaosTalismanStat> = [
      {
        title: "Critical",
        // responsive: ["sm"],
        render: (_, { critical }) => (
          <Text>{critical.map((it) => it.toLocaleString()).join(" / ")}</Text>
        ),
      },
      {
        title: "Critical Damage",
        // responsive: ["sm"],
        render: (_, { criticalDamage }) => (
          <Text>
            {criticalDamage.map((it) => it.toLocaleString()).join(" / ")}
          </Text>
        ),
      },
      {
        title: "Phy Def",
        // responsive: ["sm"],
        render: (_, { phyDef }) => (
          <Text>{phyDef.map((it) => it.toLocaleString()).join(" / ")}</Text>
        ),
      },
      {
        title: "Mag Def",
        // responsive: ["sm"],
        render: (_, { magDef }) => (
          <Text>{magDef.map((it) => it.toLocaleString()).join(" / ")}</Text>
        ),
      },
      {
        title: "Final Damage",
        // responsive: ["sm"],
        render: (_, { fd }) => (
          <Text>{fd.map((it) => it.toLocaleString()).join(" / ")}</Text>
        ),
      },
    ];

    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Eternal World Talisman",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={EternalWorldTalismanStatTable}
              columns={columnsWorldMats}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "2",
        label: "Eternal Pain Talisman",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={EternalPainTalismanStatTable}
              columns={columnsPainMats}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "3",
        label: "Eternal Chaos Talisman",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={[EternalChaosTalismanStatTable]}
              columns={columnsChaosMats}
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

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: getStatContent(),
    },
    {
      key: "2",
      label: "Mats",
      //   children: getMatsContent(),
    },
    {
      key: "3",
      label: "Eternal World Talisman",
      //   children: getBMCalc(),
    },
    {
      key: "4",
      label: "Eternal Pain Talisman",
      //   children: getVCalc(),
    },
    {
      key: "5",
      label: "Eternal Chaos Talisman",
      //   children: getAncCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["1"]} />
    </div>
  );
};

export default ExternalTalismanContent;
