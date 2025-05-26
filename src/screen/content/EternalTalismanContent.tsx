import {
  Collapse,
  CollapseProps,
  Divider,
  Slider,
  Table,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import ListingCard from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
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
import {
  columnsResource,
  getComparedData,
  getTextEmpty,
} from "../../utils/common.util";
const { Text } = Typography;

const style: React.CSSProperties = {
  display: "inline-block",
  height: 300,
  marginLeft: 20,
  marginRight: 50,
  marginTop: 10,
  marginBottom: 30,
};

interface WorldTableMaterialList {
  "Eternal Dimensional Apparition": number;
  Gold: number;
}
interface PainTableMaterialList {
  "Eternal Dimensional Apparition": number;
  "Eternal Pain Vortex": number;
  Gold: number;
}

const ExternalTalismanContent = () => {
  const [worldData, setWorldData] = useState([0, 10]);
  const [painData, setPainData] = useState([0, 5]);

  const getRemarks = (N: number) => {
    const temp = Array.from({ length: N }, (_, i) => (i + 1).toString());

    return temp.reduce(
      (obj, key) => {
        return { ...obj, [key]: `lv.${key}` };
      },
      { 0: "Don't have" }
    );
  };

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

  const worldDataSource: WorldTableMaterialList = useMemo(() => {
    const tempSlice = EternalWorldTalismanMatsTable.slice(
      worldData[0],
      worldData[1]
    );
    let tempApp = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempApp += slicedItem.apparition;
      tempGold += slicedItem.gold;
    });
    const temp: WorldTableMaterialList = {
      "Eternal Dimensional Apparition": tempApp,
      Gold: tempGold,
    };
    return temp;
  }, [worldData]);

  const worldStatDiff: EternalWorldTalismanStat | undefined = useMemo(() => {
    const { dt1, dt2 } = getComparedData(
      EternalWorldTalismanStatTable,
      worldData[0],
      worldData[1]
    );
    if (!dt2) {
      return;
    }
    if (!dt1) {
      return dt2;
    }
    return {
      encLevel: 0,
      attack: (dt2.attack ?? 0) - (dt1.attack ?? 0),
      attributePercent:
        (dt2.attributePercent ?? 0) - (dt1.attributePercent ?? 0),
      maxHP: (dt2.maxHP ?? 0) - (dt1.maxHP ?? 0),
    };
  }, [worldData]);

  const getWorldCalc = () => {
    const onAfterChange = (value: number[]) => {
      setWorldData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={getRemarks(10)}
            defaultValue={[0, 10]}
            max={10}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          <Divider orientation="left">Materials</Divider>
          <Table
            size={"small"}
            dataSource={Object.entries(worldDataSource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />

          <ListingCard
            title="Status Increase"
            data={[
              {
                title: "ATK",
                value: worldStatDiff?.attack,
                format: true,
              },
              {
                title: "Attribute",
                value: worldStatDiff?.attributePercent,
                suffix: "%",
              },
              {
                title: "MAX HP",
                value: worldStatDiff?.maxHP,
                format: true,
              },
            ]}
          />
        </div>

        <TradingHouseCalc
          data={[
            {
              name: "Eternal Dimensional Apparition",
              amt: worldDataSource["Eternal Dimensional Apparition"],
            },
          ]}
          additionalTotal={worldDataSource.Gold}
        />
      </div>
    );
  };

  const painDataSource: PainTableMaterialList = useMemo(() => {
    const tempSlice = EternalPainTalismanMatsTable.slice(
      painData[0],
      painData[1]
    );
    let tempApp = 0;
    let tempVortex = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempApp += slicedItem.apparition;
      tempVortex += slicedItem.vortex;
      tempGold += slicedItem.gold;
    });
    const temp: PainTableMaterialList = {
      "Eternal Dimensional Apparition": tempApp,
      "Eternal Pain Vortex": tempVortex,
      Gold: tempGold,
    };
    return temp;
  }, [painData]);

  const painStatDiff: EternalPainTalismanStat | undefined = useMemo(() => {
    const { dt1, dt2 } = getComparedData(
      EternalPainTalismanStatTable,
      painData[0],
      painData[1]
    );
    if (!dt2) {
      return;
    }
    if (!dt1) {
      return dt2;
    }
    return {
      encLevel: 0,
      attack: (dt2.attack ?? 0) - (dt1.attack ?? 0),
      fd: (dt2.fd ?? 0) - (dt1.fd ?? 0),
      maxHP: (dt2.maxHP ?? 0) - (dt1.maxHP ?? 0),
    };
  }, [painData]);

  const getPainCalc = () => {
    const onAfterChange = (value: number[]) => {
      setPainData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={getRemarks(5)}
            defaultValue={[0, 5]}
            max={5}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          <Divider orientation="left">Materials</Divider>
          <Table
            size={"small"}
            dataSource={Object.entries(painDataSource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />

          <ListingCard
            title="Status Increase"
            data={[
              {
                title: "ATK",
                value: painStatDiff?.attack,
                format: true,
              },
              {
                title: "FD",
                value: painStatDiff?.fd,
                format: true,
              },
              {
                title: "MAX HP",
                value: painStatDiff?.maxHP,
                format: true,
              },
            ]}
          />
        </div>

        <TradingHouseCalc
          data={[
            {
              name: "Eternal Dimensional Apparition",
              amt: painDataSource["Eternal Dimensional Apparition"],
            },
            {
              name: "Eternal Pain Vortex",
              amt: painDataSource["Eternal Pain Vortex"],
            },
          ]}
          additionalTotal={painDataSource.Gold}
        />
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
      children: getWorldCalc(),
    },
    {
      key: "4",
      label: "Eternal Pain Talisman",
      children: getPainCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default ExternalTalismanContent;
