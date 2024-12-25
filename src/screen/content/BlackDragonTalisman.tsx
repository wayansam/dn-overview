import { Collapse, CollapseProps, theme, Typography } from "antd";
import Slider, { SliderMarks } from "antd/es/slider";
import Table, { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useMemo, useState } from "react";
import {
  BDAncientElementTalismanStatTable,
  BDBaofaTalismanMatsTable,
  BDBaofaTalismanStatTable,
  BDKeenTalismanStatTable,
  BDMelukaTalismanStatTable,
  BDTitanionTalismanStatTable,
  BDUmbalaTalismanStatTable,
} from "../../data/BlackDragonTalismanData";
import {
  BDAncientElementTalismanStat,
  BDBaofaTalismanStat,
  BDKeenTalismanStat,
  BDMelukaTalismanStat,
  BDTalismanStat,
  BDTitanionTalismanStat,
  BDUmbalaTalismanStat,
} from "../../interface/ItemStat.interface";
import { getColor, getTextEmpty } from "../../utils/common.util";
const { Text } = Typography;

interface TableResource {
  mats: string;
  amount: number;
}

interface BaofaTableMaterialList {
  "Dreamy Core": number;
  "High Purity Dreamy Core": number;
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
  "0": "Don't have",
  "1": "Normal",
  "2": "Magic",
  "3": "Rare",
  "4": "Epic",
  "5": "Unique",
  "6": "Legend",
  "7": "Ancient",
};

const BlackDragonTalismanContent = () => {
  const {
    token: { colorBgContainer, colorText },
  } = theme.useToken();

  const [baofaRange, setBaofaRange] = useState([0, 6]);

  const columnsResource: ColumnsType<TableResource> = [
    { title: "Materials", dataIndex: "mats" },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 150,
    },
  ];

  const getMarkKey = (from: number, to: number) => {
    const markKey = ["0", "1", "2", "3", "4", "5", "6", "7"];
    return markKey.slice(from, to + 1);
  };

  const getFilteredMarks = (allowedKey: string[]) => {
    return Object.keys(marks)
      .filter((key) => allowedKey.includes(key))
      .reduce((obj, key) => {
        return { ...obj, [key]: marks[key] };
      }, {});
  };

  const get1stColumn = (): ColumnsType<BDTalismanStat> => {
    return [
      {
        title: "Name",
        dataIndex: "name",
        responsive: ["sm"],
      },
      {
        title: "Stage Rarity",
        dataIndex: "rarity",
        width: 150,
        render: (_, { rarity }) => (
          <Text style={{ color: getColor(rarity, colorText) }}>{rarity}</Text>
        ),
      },
    ];
  };
  const get2ndColumn = (): ColumnsType<BDTalismanStat> => {
    return [
      {
        title: "MAX HP(%)",
        responsive: ["sm"],
        render: (_, { maxHPPercent }) => (
          <Text>{getTextEmpty({ txt: maxHPPercent, tailText: "%" })}</Text>
        ),
      },
      {
        title: "ATK(%)",
        responsive: ["sm"],
        render: (_, { attackPercent }) => (
          <Text>{getTextEmpty({ txt: attackPercent, tailText: "%" })}</Text>
        ),
      },
      {
        title: "Final Damage",
        dataIndex: "fd",
        responsive: ["sm"],
        render: (_, { fd }) => (
          <Text>{getTextEmpty({ txt: fd?.join("/ ") })}</Text>
        ),
      },
      {
        title: "Craftable",
        dataIndex: "craftable",
        responsive: ["sm"],
        render: (_, { craftable }) => (
          <Text>{craftable ? "Craftable" : "Not craftable"}</Text>
        ),
      },
    ];
  };
  const getCommonTitle = (item: React.ReactNode) => {
    return (
      <div>
        {item}
        <p>MAX HP(%)</p>
        <p>ATK(%)</p>
        <p>Final Damage</p>
        <p>Craftable</p>
      </div>
    );
  };
  const getCommonContent = (item: React.ReactNode, data: BDTalismanStat) => {
    const { maxHPPercent, attackPercent, fd, craftable } = data;
    return (
      <div>
        {item}
        <p>HP {getTextEmpty({ txt: maxHPPercent, tailText: "%" })}</p>
        <p>ATT {getTextEmpty({ txt: attackPercent, tailText: "%" })}</p>
        <p>FD {getTextEmpty({ txt: fd?.join("/ ") })}</p>
        <p>{craftable ? "Craftable" : "Not craftable"}</p>
      </div>
    );
  };

  const columnsBaofaMats: ColumnsType<BDBaofaTalismanStat> = [
    ...get1stColumn(),
    {
      title: getCommonTitle(<p>MAX HP</p>),
      responsive: ["xs"],
      width: 150,
      render: (_, { maxHP, ...item }) =>
        getCommonContent(<p>HP {maxHP?.toLocaleString()}</p>, item),
    },
    {
      title: "MAX HP",
      responsive: ["sm"],
      width: 175,
      render: (_, { maxHP }) => <Text>{maxHP?.toLocaleString()}</Text>,
    },
    ...get2ndColumn(),
  ];

  const columnsUmbalaMats: ColumnsType<BDUmbalaTalismanStat> = [
    ...get1stColumn(),
    {
      title: getCommonTitle(<p>Phy Def</p>),
      responsive: ["xs"],
      width: 150,
      render: (_, { phyDef, ...item }) =>
        getCommonContent(<p>Phy Def {phyDef?.toLocaleString()}</p>, item),
    },
    {
      title: "Phy Def",
      responsive: ["sm"],
      width: 175,
      render: (_, { phyDef }) => <Text>{phyDef?.toLocaleString()}</Text>,
    },
    ...get2ndColumn(),
  ];

  const columnsMelukaMats: ColumnsType<BDMelukaTalismanStat> = [
    ...get1stColumn(),
    {
      title: getCommonTitle(<p>Mag Def</p>),
      responsive: ["xs"],
      width: 150,
      render: (_, { magDef, ...item }) =>
        getCommonContent(<p>Mag Def {magDef?.toLocaleString()}</p>, item),
    },
    {
      title: "Mag Def",
      responsive: ["sm"],
      width: 175,
      render: (_, { magDef }) => <Text>{magDef?.toLocaleString()}</Text>,
    },
    ...get2ndColumn(),
  ];

  const columnsTitanionMats: ColumnsType<BDTitanionTalismanStat> = [
    ...get1stColumn(),
    {
      title: getCommonTitle(<p>Attack</p>),
      responsive: ["xs"],
      width: 150,
      render: (_, { attack, ...item }) =>
        getCommonContent(<p>Attack {attack?.toLocaleString()}</p>, item),
    },
    {
      title: "Attack",
      responsive: ["sm"],
      width: 175,
      render: (_, { attack }) => <Text>{attack?.toLocaleString()}</Text>,
    },
    ...get2ndColumn(),
  ];

  const columnsKeenMats: ColumnsType<BDKeenTalismanStat> = [
    ...get1stColumn(),
    {
      title: getCommonTitle(
        <>
          <p>Attack</p>
          <p>CRT</p>
          <p>CDM</p>
        </>
      ),
      responsive: ["xs"],
      width: 150,
      render: (_, { attack, critical, criticalDamage, ...item }) =>
        getCommonContent(
          <>
            <p>Attack {attack?.toLocaleString()}</p>
            <p>CRT {critical?.toLocaleString()}</p>
            <p>CDM {criticalDamage?.toLocaleString()}</p>
          </>,
          item
        ),
    },
    {
      title: "Attack",
      responsive: ["sm"],
      width: 175,
      render: (_, { attack }) => <Text>{attack?.toLocaleString()}</Text>,
    },
    {
      title: "CRT",
      responsive: ["sm"],
      width: 175,
      render: (_, { critical }) => <Text>{critical?.toLocaleString()}</Text>,
    },
    {
      title: "CDM",
      responsive: ["sm"],
      width: 175,
      render: (_, { criticalDamage }) => (
        <Text>{criticalDamage?.toLocaleString()}</Text>
      ),
    },
    ...get2ndColumn(),
  ];

  const columnsAncientElementMats: ColumnsType<BDAncientElementTalismanStat> = [
    ...get1stColumn(),
    {
      title: getCommonTitle(
        <>
          <p>Element Att</p>
          <p>Attack</p>
        </>
      ),
      responsive: ["xs"],
      width: 150,
      render: (_, { attributePercent, attack, ...item }) =>
        getCommonContent(
          <>
            <p>Ele {getTextEmpty({ txt: attributePercent, tailText: "%" })}</p>
            <p>Attack {attack?.toLocaleString()}</p>
          </>,
          item
        ),
    },
    {
      title: "Element Att",
      responsive: ["sm"],
      width: 150,
      render: (_, { attributePercent }) => (
        <Text>{getTextEmpty({ txt: attributePercent, tailText: "%" })}</Text>
      ),
    },
    {
      title: "Attack",
      responsive: ["sm"],
      width: 175,
      render: (_, { attack }) => <Text>{attack?.toLocaleString()}</Text>,
    },
    ...get2ndColumn(),
  ];

  const getStatContent = () => (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
      <div style={{ width: 500, marginRight: 10 }}>
        <Title level={5}>{"Baofa"}</Title>
        <Table
          size={"small"}
          dataSource={BDBaofaTalismanStatTable}
          columns={columnsBaofaMats}
          pagination={false}
          bordered
        />
      </div>

      <div style={{ width: 500, marginRight: 10 }}>
        <Title level={5}>{"Umbala"}</Title>
        <Table
          size={"small"}
          dataSource={BDUmbalaTalismanStatTable}
          columns={columnsUmbalaMats}
          pagination={false}
          bordered
        />
      </div>

      <div style={{ width: 500, marginRight: 10 }}>
        <Title level={5}>{"Meluka"}</Title>
        <Table
          size={"small"}
          dataSource={BDMelukaTalismanStatTable}
          columns={columnsMelukaMats}
          pagination={false}
          bordered
        />
      </div>

      <div style={{ width: 500, marginRight: 10 }}>
        <Title level={5}>{"Titanion"}</Title>
        <Table
          size={"small"}
          dataSource={BDTitanionTalismanStatTable}
          columns={columnsTitanionMats}
          pagination={false}
          bordered
        />
      </div>

      <div style={{ width: 700, marginRight: 10 }}>
        <Title level={5}>{"Keen"}</Title>
        <Table
          size={"small"}
          dataSource={BDKeenTalismanStatTable}
          columns={columnsKeenMats}
          pagination={false}
          bordered
        />
      </div>

      <div style={{ width: 600, marginRight: 10 }}>
        <Title level={5}>{"Ancient Element"}</Title>
        <Table
          size={"small"}
          dataSource={BDAncientElementTalismanStatTable}
          columns={columnsAncientElementMats}
          pagination={false}
          bordered
        />
      </div>
    </div>
  );

  const baofaDataSource: BaofaTableMaterialList = useMemo(() => {
    const tempSlice = BDBaofaTalismanMatsTable.slice(
      baofaRange[0],
      baofaRange[1]
    );
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    // tempSlice.forEach((slicedItem) => {
    //   tempHFrag += slicedItem.higherFragment;
    //   tempLFrag += slicedItem.lowerFragment;
    //   tempGold += slicedItem.gold;
    // });
    const temp: BaofaTableMaterialList = {
      "Dreamy Core": tempLFrag,
      "High Purity Dreamy Core": tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [baofaRange]);

  const getBaofaCalc = () => {
    const onAfterChange = (value: number[]) => {
      setBaofaRange(value);
    };

    console.log({ marks });

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={getFilteredMarks(getMarkKey(0, 6))}
            defaultValue={[0, 6]}
            max={6}
            min={0}
            onAfterChange={onAfterChange}
          />
        </div>
        <div>
          {/* {showDWarning && (
            <div>
              <Alert
                banner
                message="From +11 onward, the enhancement might fail"
                type="warning"
              />
            </div>
          )} */}
          <Table
            size={"small"}
            dataSource={Object.entries(baofaDataSource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {/* {statRangeD && (
            <div>
              <Card size="small" style={{ marginTop: 4 }}>
                <Space direction="vertical">
                  <Text>ATK +{statRangeD.attackPercent}%</Text>
                  <Text>Cooldown Decrease {statRangeD.cooldownPercent}%</Text>
                </Space>
              </Card>
            </div>
          )} */}
        </div>
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
      label: "Baofa",
      children: getBaofaCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["2"]} />
    </div>
  );
};

export default BlackDragonTalismanContent;
