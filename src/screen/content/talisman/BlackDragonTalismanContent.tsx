import { Collapse, CollapseProps, theme, Typography } from "antd";
import { SliderMarks } from "antd/es/slider";
import Table, { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import JadeCalculatorPanel from "../../../components/JadeCalculatorPanel";
import { ITEM_RARITY } from "../../../constants/InGame.constants";
import {
  BDAncientElementTalismanStatTable,
  BDBaofaTalismanMatsTable,
  BDBaofaTalismanStatTable,
  BDKeenTalismanStatTable,
  BDMelukaTalismanMatsTable,
  BDMelukaTalismanStatTable,
  BDTitanionTalismanMatsTable,
  BDTitanionTalismanStatTable,
  BDUmbalaTalismanMatsTable,
  BDUmbalaTalismanStatTable,
} from "../../../data/talisman/BlackDragonTalismanData";
import { BlackDragonTalismanCraftMaterial } from "../../../interface/Item.interface";
import {
  BDAncientElementTalismanStat,
  BDBaofaTalismanStat,
  BDKeenTalismanStat,
  BDMelukaTalismanStat,
  BDTalismanStat,
  BDTitanionTalismanStat,
  BDUmbalaTalismanStat,
  CommonItemStats,
} from "../../../interface/ItemStat.interface";
import {
  combineEqStats,
  getColor,
  getComparedData,
  getTextEmpty,
} from "../../../utils/common.util";
const { Text } = Typography;

interface TalismanTableMaterialList {
  "Black Dragon Memories": number;
  Garnet: number;
  Essence: number;
  Gold: number;
}
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

  const defaultRange: number[] = [0, 5];
  const [baofaRange, setBaofaRange] = useState(defaultRange);
  const [umbalaRange, setUmbalaRange] = useState(defaultRange);
  const [melukaRange, setMelukaRange] = useState(defaultRange);
  const [titanRange, setTitanRange] = useState(defaultRange);

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
        render: (_, { hpPercent }) => (
          <Text>{getTextEmpty({ txt: hpPercent, tailText: "%" })}</Text>
        ),
      },
      {
        title: "ATK(%)",
        responsive: ["sm"],
        render: (_, { phyMagAtkPercent }) => (
          <Text>{getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}</Text>
        ),
      },
      {
        title: "Final Damage",
        dataIndex: "fdOptions",
        responsive: ["sm"],
        render: (_, { fdOptions }) => (
          <Text>{getTextEmpty({ txt: fdOptions?.join("/ ") })}</Text>
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
    const { hpPercent, phyMagAtkPercent, fdOptions, craftable } = data;
    return (
      <div>
        {item}
        <p>HP {getTextEmpty({ txt: hpPercent, tailText: "%" })}</p>
        <p>ATK {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}</p>
        <p>FD {getTextEmpty({ txt: fdOptions?.join("/ ") })}</p>
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
      render: (_, { hp, ...item }) =>
        getCommonContent(<p>HP {hp?.toLocaleString()}</p>, item),
    },
    {
      title: "MAX HP",
      responsive: ["sm"],
      width: 175,
      render: (_, { hp }) => <Text>{hp?.toLocaleString()}</Text>,
    },
    ...get2ndColumn(),
  ];

  const columnsUmbalaMats: ColumnsType<BDUmbalaTalismanStat> = [
    ...get1stColumn(),
    {
      title: getCommonTitle(<p>Phy Def</p>),
      responsive: ["xs"],
      width: 150,
      render: (_, { def, ...item }) =>
        getCommonContent(<p>Phy Def {def?.toLocaleString()}</p>, item),
    },
    {
      title: "Phy Def",
      responsive: ["sm"],
      width: 175,
      render: (_, { def }) => <Text>{def?.toLocaleString()}</Text>,
    },
    ...get2ndColumn(),
  ];

  const columnsMelukaMats: ColumnsType<BDMelukaTalismanStat> = [
    ...get1stColumn(),
    {
      title: getCommonTitle(<p>Mag Def</p>),
      responsive: ["xs"],
      width: 150,
      render: (_, { magdef, ...item }) =>
        getCommonContent(<p>Mag Def {magdef?.toLocaleString()}</p>, item),
    },
    {
      title: "Mag Def",
      responsive: ["sm"],
      width: 175,
      render: (_, { magdef }) => <Text>{magdef?.toLocaleString()}</Text>,
    },
    ...get2ndColumn(),
  ];

  const columnsTitanionMats: ColumnsType<BDTitanionTalismanStat> = [
    ...get1stColumn(),
    {
      title: getCommonTitle(<p>Attack</p>),
      responsive: ["xs"],
      width: 150,
      render: (_, { phyMagAtk, ...item }) =>
        getCommonContent(<p>Attack {phyMagAtk?.toLocaleString()}</p>, item),
    },
    {
      title: "Attack",
      responsive: ["sm"],
      width: 175,
      render: (_, { phyMagAtk }) => <Text>{phyMagAtk?.toLocaleString()}</Text>,
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
      render: (_, { phyMagAtk, crt, cdm, ...item }) =>
        getCommonContent(
          <>
            <p>Attack {phyMagAtk?.toLocaleString()}</p>
            <p>CRT {crt?.toLocaleString()}</p>
            <p>CDM {cdm?.toLocaleString()}</p>
          </>,
          item
        ),
    },
    {
      title: "Attack",
      responsive: ["sm"],
      width: 175,
      render: (_, { phyMagAtk }) => <Text>{phyMagAtk?.toLocaleString()}</Text>,
    },
    {
      title: "CRT",
      responsive: ["sm"],
      width: 175,
      render: (_, { crt }) => <Text>{crt?.toLocaleString()}</Text>,
    },
    {
      title: "CDM",
      responsive: ["sm"],
      width: 175,
      render: (_, { cdm }) => <Text>{cdm?.toLocaleString()}</Text>,
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
      render: (_, { attAtkPercent, phyMagAtk, ...item }) =>
        getCommonContent(
          <>
            <p>Ele {getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</p>
            <p>Attack {phyMagAtk?.toLocaleString()}</p>
          </>,
          item
        ),
    },
    {
      title: "Element Att",
      responsive: ["sm"],
      width: 150,
      render: (_, { attAtkPercent }) => (
        <Text>{getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</Text>
      ),
    },
    {
      title: "Attack",
      responsive: ["sm"],
      width: 175,
      render: (_, { phyMagAtk }) => <Text>{phyMagAtk?.toLocaleString()}</Text>,
    },
    ...get2ndColumn(),
  ];

  const getStatContent = () => {
    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Baofa",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              rowKey="rarity"
              dataSource={BDBaofaTalismanStatTable}
              columns={columnsBaofaMats}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "2",
        label: "Umbala",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              rowKey="rarity"
              dataSource={BDUmbalaTalismanStatTable}
              columns={columnsUmbalaMats}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "3",
        label: "Meluka",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              rowKey="rarity"
              dataSource={BDMelukaTalismanStatTable}
              columns={columnsMelukaMats}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "4",
        label: "Titanion",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              rowKey="rarity"
              dataSource={BDTitanionTalismanStatTable}
              columns={columnsTitanionMats}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "5",
        label: "Keen",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              rowKey="rarity"
              dataSource={BDKeenTalismanStatTable}
              columns={columnsKeenMats}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "6",
        label: "Ancient Element",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              rowKey="rarity"
              dataSource={BDAncientElementTalismanStatTable}
              columns={columnsAncientElementMats}
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

  const getColumnsMats = (
    type: string
  ): ColumnsType<BlackDragonTalismanCraftMaterial> => {
    return [
      {
        title: "Stage Rarity",
        dataIndex: "rarity",
        width: 80,
        render: (_, { rarity }) => (
          <Text style={{ color: getColor(rarity, colorText) }}>{rarity}</Text>
        ),
      },
      {
        title: (
          <div>
            <p>Black Dragon Memories</p>
            <p>{type} Fragment</p>
            <p>Garnet</p>
            <p>Essence</p>
            <p>Gold</p>
          </div>
        ),
        responsive: ["xs"],
        render: (_, { bdMemories, fragment, garnet, essence, gold }) => (
          <div>
            <p>{bdMemories.toLocaleString()} (BD memo)</p>
            <p>{fragment.toLocaleString()} (frag)</p>
            <p>{garnet.toLocaleString()} (garnet)</p>
            <p>{essence.toLocaleString()} (ess)</p>
            <p>{gold.toLocaleString()} (g)</p>
          </div>
        ),
      },
      {
        title: "Black Dragon Memories",
        dataIndex: "bdMemories",
        responsive: ["sm"],
        render: (_, { bdMemories }) => (
          <Text>{bdMemories.toLocaleString()}</Text>
        ),
      },
      {
        title: `${type} Fragment`,
        dataIndex: "fragment",
        responsive: ["sm"],
        render: (_, { fragment }) => <Text>{fragment.toLocaleString()}</Text>,
      },
      {
        title: "Garnet",
        dataIndex: "garnet",
        responsive: ["sm"],
        render: (_, { garnet }) => <Text>{garnet.toLocaleString()}</Text>,
      },
      {
        title: "Essence",
        dataIndex: "essence",
        responsive: ["sm"],
        render: (_, { essence }) => <Text>{essence.toLocaleString()}</Text>,
      },
      {
        title: "Gold",
        dataIndex: "gold",
        responsive: ["sm"],
        render: (_, { gold }) => <Text>{gold.toLocaleString()}</Text>,
        width: 90,
      },
    ];
  };

  const getMatsContent = () => {
    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Baofa",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              rowKey="rarity"
              dataSource={BDBaofaTalismanMatsTable.filter(
                (it) => it.rarity !== ITEM_RARITY.LEGEND
              )}
              columns={getColumnsMats("Baofa")}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "2",
        label: "Umbala",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              rowKey="rarity"
              dataSource={BDUmbalaTalismanMatsTable.filter(
                (it) => it.rarity !== ITEM_RARITY.LEGEND
              )}
              columns={getColumnsMats("Umbala")}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "3",
        label: "Meluka",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              rowKey="rarity"
              dataSource={BDMelukaTalismanMatsTable.filter(
                (it) => it.rarity !== ITEM_RARITY.LEGEND
              )}
              columns={getColumnsMats("Meluka")}
              pagination={false}
              bordered
            />
          </div>
        ),
      },
      {
        key: "4",
        label: "Titanion",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              rowKey="rarity"
              dataSource={BDTitanionTalismanMatsTable.filter(
                (it) => it.rarity !== ITEM_RARITY.LEGEND
              )}
              columns={getColumnsMats("Titanion")}
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

  // Every talisman's mats calculator sums the same 5 fields off a
  // craftable-gated slice, differing only by which fragment name the sum
  // gets tagged under. Non-craftable items in range means the item can't
  // actually be enhanced there, so the whole result is undefined rather than
  // a (misleadingly complete-looking) zeroed table.
  const getTalismanMats = <K extends string>(
    matsTable: BlackDragonTalismanCraftMaterial[],
    range: number[],
    fragmentKey: K
  ): (TalismanTableMaterialList & Record<K, number>) | undefined => {
    const tempSlice = matsTable.slice(range[0], range[1]);
    const nonCraftable = tempSlice.some((it) => !it.craftable);
    if (nonCraftable) {
      return undefined;
    }
    let tempMemories = 0;
    let tempFrag = 0;
    let tempGold = 0;
    let tempGarnet = 0;
    let tempEssence = 0;
    tempSlice.forEach((slicedItem) => {
      tempMemories += slicedItem.bdMemories;
      tempFrag += slicedItem.fragment;
      tempGarnet += slicedItem.garnet;
      tempEssence += slicedItem.essence;
      tempGold += slicedItem.gold;
    });
    return {
      "Black Dragon Memories": tempMemories,
      Garnet: tempGarnet,
      Essence: tempEssence,
      Gold: tempGold,
      [fragmentKey]: tempFrag,
    } as TalismanTableMaterialList & Record<K, number>;
  };

  // Baofa
  const baofaDataSource = useMemo(
    () => getTalismanMats(BDBaofaTalismanMatsTable, baofaRange, "Baofa Fragment"),
    [baofaRange]
  );

  const baofaStatDiff: CommonItemStats | undefined = useMemo(() => {
    const { dt1, dt2 } = getComparedData(
      BDBaofaTalismanStatTable,
      baofaRange[0],
      baofaRange[1]
    );
    if (!dt2) {
      return undefined;
    }
    return dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
  }, [baofaRange]);

  const getBaofaCalc = () => (
    <JadeCalculatorPanel
      rangeSlider={{
        value: baofaRange as [number, number],
        onChange: setBaofaRange,
        max: 6,
        marks: getFilteredMarks(getMarkKey(0, 6)),
      }}
      flags={[
        {
          show: !baofaDataSource,
          message: "Legend Talisman is non craftable",
          type: "warning",
        },
      ]}
      mats={{ data: baofaDataSource ?? {} }}
      tradingHouse={
        baofaDataSource && {
          data: [
            {
              name: "Black Dragon Memories",
              amt: baofaDataSource["Black Dragon Memories"],
            },
            { name: "Garnet", amt: baofaDataSource.Garnet },
            { name: "Essence", amt: baofaDataSource.Essence },
          ],
          additionalTotal: baofaDataSource.Gold,
        }
      }
      stats={baofaStatDiff && { statDif: baofaStatDiff }}
    />
  );

  // Umbala
  const umbalaDataSource = useMemo(
    () =>
      getTalismanMats(BDUmbalaTalismanMatsTable, umbalaRange, "Umbala Fragment"),
    [umbalaRange]
  );

  const umbalaStatDiff: CommonItemStats | undefined = useMemo(() => {
    const { dt1, dt2 } = getComparedData(
      BDUmbalaTalismanStatTable,
      umbalaRange[0],
      umbalaRange[1]
    );
    if (!dt2) {
      return undefined;
    }
    return dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
  }, [umbalaRange]);

  const getUmbalaCalc = () => (
    <JadeCalculatorPanel
      rangeSlider={{
        value: umbalaRange as [number, number],
        onChange: setUmbalaRange,
        max: 6,
        marks: getFilteredMarks(getMarkKey(0, 6)),
      }}
      flags={[
        {
          show: !umbalaDataSource,
          message: "Legend Talisman is non craftable",
          type: "warning",
        },
      ]}
      mats={{ data: umbalaDataSource ?? {} }}
      tradingHouse={
        umbalaDataSource && {
          data: [
            {
              name: "Black Dragon Memories",
              amt: umbalaDataSource["Black Dragon Memories"],
            },
            { name: "Garnet", amt: umbalaDataSource.Garnet },
            { name: "Essence", amt: umbalaDataSource.Essence },
          ],
          additionalTotal: umbalaDataSource.Gold,
        }
      }
      stats={umbalaStatDiff && { statDif: umbalaStatDiff }}
    />
  );

  // Meluka
  const melukaDataSource = useMemo(
    () =>
      getTalismanMats(BDMelukaTalismanMatsTable, melukaRange, "Meluka Fragment"),
    [melukaRange]
  );

  const melukaStatDiff: CommonItemStats | undefined = useMemo(() => {
    const { dt1, dt2 } = getComparedData(
      BDMelukaTalismanStatTable,
      melukaRange[0],
      melukaRange[1]
    );
    if (!dt2) {
      return undefined;
    }
    return dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
  }, [melukaRange]);

  const getMelukaCalc = () => (
    <JadeCalculatorPanel
      rangeSlider={{
        value: melukaRange as [number, number],
        onChange: setMelukaRange,
        max: 6,
        marks: getFilteredMarks(getMarkKey(0, 6)),
      }}
      flags={[
        {
          show: !melukaDataSource,
          message: "Legend Talisman is non craftable",
          type: "warning",
        },
      ]}
      mats={{ data: melukaDataSource ?? {} }}
      tradingHouse={
        melukaDataSource && {
          data: [
            {
              name: "Black Dragon Memories",
              amt: melukaDataSource["Black Dragon Memories"],
            },
            { name: "Garnet", amt: melukaDataSource.Garnet },
            { name: "Essence", amt: melukaDataSource.Essence },
          ],
          additionalTotal: melukaDataSource.Gold,
        }
      }
      stats={melukaStatDiff && { statDif: melukaStatDiff }}
    />
  );

  // Titanion
  const titanionDataSource = useMemo(
    () =>
      getTalismanMats(
        BDTitanionTalismanMatsTable,
        titanRange,
        "Titanion Fragment"
      ),
    [titanRange]
  );

  const titanionStatDiff: CommonItemStats | undefined = useMemo(() => {
    const { dt1, dt2 } = getComparedData(
      BDTitanionTalismanStatTable,
      titanRange[0],
      titanRange[1]
    );
    if (!dt2) {
      return undefined;
    }
    return dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
  }, [titanRange]);

  const getTitanionCalc = () => (
    <JadeCalculatorPanel
      rangeSlider={{
        value: titanRange as [number, number],
        onChange: setTitanRange,
        max: 6,
        marks: getFilteredMarks(getMarkKey(0, 6)),
      }}
      flags={[
        {
          show: !titanionDataSource,
          message: "Legend Talisman is non craftable",
          type: "warning",
        },
      ]}
      mats={{ data: titanionDataSource ?? {} }}
      tradingHouse={
        titanionDataSource && {
          data: [
            {
              name: "Black Dragon Memories",
              amt: titanionDataSource["Black Dragon Memories"],
            },
            { name: "Garnet", amt: titanionDataSource.Garnet },
            { name: "Essence", amt: titanionDataSource.Essence },
          ],
          additionalTotal: titanionDataSource.Gold,
        }
      }
      stats={titanionStatDiff && { statDif: titanionStatDiff }}
    />
  );

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
      label: "Baofa",
      children: getBaofaCalc(),
    },
    {
      key: "4",
      label: "Umbala",
      children: getUmbalaCalc(),
    },
    {
      key: "5",
      label: "Meluka",
      children: getMelukaCalc(),
    },
    {
      key: "6",
      label: "Titanion",
      children: getTitanionCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default BlackDragonTalismanContent;
