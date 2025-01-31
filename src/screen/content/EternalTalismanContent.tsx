import { Collapse, CollapseProps, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  EternalChaosTalismanStatTable,
  EternalPainTalismanMatsTable,
  EternalPainTalismanStatTable,
  EternalWorldTalismanMatsTable,
  EternalWorldTalismanStatTable,
} from "../../data/EternalTalismanData";
import {
  EternalPainTalismanMats,
  EternalWorldTalismanMats,
} from "../../interface/Item.interface";
import {
  EternalChaosTalismanStat,
  EternalPainTalismanStat,
  EternalWorldTalismanStat,
} from "../../interface/ItemStat.interface";
import { getTextEmpty } from "../../utils/common.util";
const { Text } = Typography;

const ExternalTalismanContent = () => {
  const getStatContent = () => {
    const columnsWorldStats: ColumnsType<EternalWorldTalismanStat> = [
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
              Attribute {getTextEmpty({ txt: attributePercent, tailText: "%" })}
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

    const columnsPainStats: ColumnsType<EternalPainTalismanStat> = [
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

    const columnsChaosStats: ColumnsType<EternalChaosTalismanStat> = [
      {
        title: (
          <>
            <p>Critical</p>
            <p>Critical Damage</p>
            <p>Phy Def</p>
            <p>Mag Def</p>
            <p>Final Damage</p>
          </>
        ),
        responsive: ["xs"],
        width: 150,
        render: (_, { critical, criticalDamage, phyDef, magDef, fd }) => (
          <>
            <p>CRT </p>
            {critical.map((it) => it.toLocaleString()).join(" / ")}

            <p>CDM</p>
            {criticalDamage.map((it) => it.toLocaleString()).join(" / ")}

            <p>Phy Def</p>
            {phyDef.map((it) => it.toLocaleString()).join(" / ")}

            <p>Mag Def</p>
            {magDef.map((it) => it.toLocaleString()).join(" / ")}

            <p>FD</p>
            {fd.map((it) => it.toLocaleString()).join(" / ")}
          </>
        ),
      },
      {
        title: "Critical",
        responsive: ["sm"],
        width: 70,
        render: (_, { critical }) => (
          <Text>
            {critical.map((it) => (
              <p>{it.toLocaleString()}</p>
            ))}
          </Text>
        ),
      },
      {
        title: "Critical Damage",
        responsive: ["sm"],
        render: (_, { criticalDamage }) => (
          <Text>
            {criticalDamage.map((it) => (
              <p>{it.toLocaleString()}</p>
            ))}
          </Text>
        ),
      },
      {
        title: "Phy Def",
        responsive: ["sm"],
        render: (_, { phyDef }) => (
          <Text>
            {phyDef.map((it) => (
              <p>{it.toLocaleString()}</p>
            ))}
          </Text>
        ),
      },
      {
        title: "Mag Def",
        responsive: ["sm"],
        render: (_, { magDef }) => (
          <Text>
            {magDef.map((it) => (
              <p>{it.toLocaleString()}</p>
            ))}
          </Text>
        ),
      },
      {
        title: "Final Damage",
        responsive: ["sm"],
        render: (_, { fd }) => (
          <Text>
            {fd.map((it) => (
              <p>{it.toLocaleString()}</p>
            ))}
          </Text>
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
              columns={columnsWorldStats}
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
              columns={columnsPainStats}
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
              columns={columnsChaosStats}
              pagination={false}
              bordered
            />
            <i>notes: random add on stat</i>
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
    const columnsWorldMats: ColumnsType<EternalWorldTalismanMats> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Eternal Dim. Apparition</p>
            <p>Gold</p>
          </div>
        ),
        responsive: ["xs"],
        render: (_, { apparition, gold }) => (
          <div>
            <p>{apparition.toLocaleString()} (app)</p>
            <p>{gold.toLocaleString()} (g)</p>
          </div>
        ),
      },
      {
        title: "Eternal Dimensional Apparition",
        responsive: ["sm"],
        render: (_, { apparition }) => (
          <Text>{apparition.toLocaleString()}</Text>
        ),
      },
      {
        title: "Gold",
        responsive: ["sm"],
        render: (_, { gold }) => <Text>{gold.toLocaleString()}</Text>,
      },
    ];
    const columnsPainMats: ColumnsType<EternalPainTalismanMats> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Eternal Dim. Apparition</p>
            <p>Eternal Pain Vortex</p>
            <p>Gold</p>
          </div>
        ),
        responsive: ["xs"],
        render: (_, { apparition, vortex, gold }) => (
          <div>
            <p>{apparition.toLocaleString()} (app)</p>
            <p>{vortex.toLocaleString()} (vort)</p>
            <p>{gold.toLocaleString()} (g)</p>
          </div>
        ),
      },
      {
        title: "Eternal Dimensional Apparition",
        responsive: ["sm"],
        render: (_, { apparition }) => (
          <Text>{apparition.toLocaleString()}</Text>
        ),
      },
      {
        title: "Eternal Pain Vortex",
        responsive: ["sm"],
        render: (_, { vortex }) => <Text>{vortex.toLocaleString()}</Text>,
      },
      {
        title: "Gold",
        responsive: ["sm"],
        width: 70,
        render: (_, { gold }) => <Text>{gold.toLocaleString()}</Text>,
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
              dataSource={EternalWorldTalismanMatsTable}
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
              dataSource={EternalPainTalismanMatsTable}
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
            <i>notes: You cannot craft this type of talisman.</i>
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
      children: getMatsContent(),
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
