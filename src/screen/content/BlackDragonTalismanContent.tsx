import {
  Alert,
  Collapse,
  CollapseProps,
  Divider,
  theme,
  Typography,
} from "antd";
import Slider, { SliderMarks } from "antd/es/slider";
import Table, { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import ListingCard from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import { ITEM_RARITY } from "../../constants/InGame.constants";
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
} from "../../data/BlackDragonTalismanData";
import { BlackDragonTalismanCraftMaterial } from "../../interface/Item.interface";
import {
  BDAncientElementTalismanStat,
  BDBaofaTalismanStat,
  BDKeenTalismanStat,
  BDMelukaTalismanStat,
  BDTalismanStat,
  BDTitanionTalismanStat,
  BDUmbalaTalismanStat,
} from "../../interface/ItemStat.interface";
import {
  columnsResource,
  getColor,
  getComparedData,
  getTextEmpty,
} from "../../utils/common.util";
const { Text } = Typography;

interface TalismanTableMaterialList {
  "Black Dragon Memories": number;
  Garnet: number;
  Essence: number;
  Gold: number;
}
interface BaofaTableMaterialList extends TalismanTableMaterialList {
  "Baofa Fragment": number;
}
interface UmbalaTableMaterialList extends TalismanTableMaterialList {
  "Umbala Fragment": number;
}
interface MelukaTableMaterialList extends TalismanTableMaterialList {
  "Meluka Fragment": number;
}
interface TitanionTableMaterialList extends TalismanTableMaterialList {
  "Titanion Fragment": number;
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
        <p>ATK {getTextEmpty({ txt: attackPercent, tailText: "%" })}</p>
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

  const getStatContent = () => {
    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Baofa",
        children: (
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
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

  const getSum = (temp: BlackDragonTalismanCraftMaterial[]) => {
    let tempMemories = 0;
    let tempFrag = 0;
    let tempGold = 0;
    let tempGarnet = 0;
    let tempEssence = 0;

    temp.forEach((slicedItem) => {
      tempMemories += slicedItem.bdMemories;
      tempFrag += slicedItem.fragment;
      tempGarnet += slicedItem.garnet;
      tempEssence += slicedItem.essence;
      tempGold += slicedItem.gold;
    });
    return {
      tempMemories,
      tempFrag,
      tempGold,
      tempGarnet,
      tempEssence,
    };
  };

  // Baofa
  const baofaDataSource: BaofaTableMaterialList | undefined = useMemo(() => {
    const tempSlice = BDBaofaTalismanMatsTable.slice(
      baofaRange[0],
      baofaRange[1]
    );
    const nonCraftable = tempSlice.map((it) => it.craftable).includes(false);
    if (nonCraftable) {
      return;
    }
    const { tempMemories, tempFrag, tempGold, tempGarnet, tempEssence } =
      getSum(tempSlice);

    const temp: BaofaTableMaterialList = {
      "Black Dragon Memories": tempMemories,
      "Baofa Fragment": tempFrag,
      Garnet: tempGarnet,
      Essence: tempEssence,
      Gold: tempGold,
    };
    return temp;
  }, [baofaRange]);

  const baofaStatDiff: BDBaofaTalismanStat | undefined = useMemo(() => {
    const { dt1, dt2 } = getComparedData(
      BDBaofaTalismanStatTable,
      baofaRange[0],
      baofaRange[1]
    );
    if (!dt2) {
      return;
    }
    if (!dt1) {
      return dt2;
    }
    return {
      name: "",
      rarity: ITEM_RARITY.CRAFT,
      maxHPPercent: (dt2.maxHPPercent ?? 0) - (dt1.maxHPPercent ?? 0),
      attackPercent: (dt2.attackPercent ?? 0) - (dt1.attackPercent ?? 0),
      fd: [],
      craftable: true,
      maxHP: (dt2.maxHP ?? 0) - (dt1.maxHP ?? 0),
    };
  }, [baofaRange]);

  const getBaofaCalc = () => {
    const onAfterChange = (value: number[]) => {
      setBaofaRange(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={getFilteredMarks(getMarkKey(0, 6))}
            defaultValue={defaultRange}
            max={6}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          <Divider orientation="left">Materials</Divider>
          {!baofaDataSource && (
            <div>
              <Alert
                banner
                message="Legend Talisman is non craftable"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(baofaDataSource ?? {}).map(
              ([key, value]) => ({
                mats: key,
                amount: value,
              })
            )}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {baofaStatDiff && (
            <ListingCard
              title="Status Increase"
              data={[
                {
                  title: "ATK",
                  value: baofaStatDiff.attackPercent,
                  suffix: "%",
                },
                {
                  title: "MAX HP",
                  value: baofaStatDiff.maxHPPercent,
                  suffix: "%",
                },
                {
                  title: "MAX HP",
                  value: baofaStatDiff.maxHP,
                  format: true,
                },
              ]}
            />
          )}
        </div>

        {baofaDataSource && (
          <TradingHouseCalc
            data={[
              {
                name: "Black Dragon Memories",
                amt: baofaDataSource["Black Dragon Memories"],
              },
              {
                name: "Garnet",
                amt: baofaDataSource.Garnet,
              },
              {
                name: "Essence",
                amt: baofaDataSource.Essence,
              },
            ]}
            additionalTotal={baofaDataSource.Gold}
          />
        )}
      </div>
    );
  };

  // Umbala
  const umbalaDataSource: UmbalaTableMaterialList | undefined = useMemo(() => {
    const tempSlice = BDUmbalaTalismanMatsTable.slice(
      umbalaRange[0],
      umbalaRange[1]
    );
    const nonCraftable = tempSlice.map((it) => it.craftable).includes(false);
    if (nonCraftable) {
      return;
    }
    const { tempMemories, tempFrag, tempGold, tempGarnet, tempEssence } =
      getSum(tempSlice);

    const temp: UmbalaTableMaterialList = {
      "Black Dragon Memories": tempMemories,
      "Umbala Fragment": tempFrag,
      Garnet: tempGarnet,
      Essence: tempEssence,
      Gold: tempGold,
    };
    return temp;
  }, [umbalaRange]);

  const umbalaStatDiff: BDUmbalaTalismanStat | undefined = useMemo(() => {
    const { dt1, dt2 } = getComparedData(
      BDUmbalaTalismanStatTable,
      umbalaRange[0],
      umbalaRange[1]
    );
    if (!dt2) {
      return;
    }
    if (!dt1) {
      return dt2;
    }
    return {
      name: "",
      rarity: ITEM_RARITY.CRAFT,
      maxHPPercent: (dt2.maxHPPercent ?? 0) - (dt1.maxHPPercent ?? 0),
      attackPercent: (dt2.attackPercent ?? 0) - (dt1.attackPercent ?? 0),
      fd: [],
      craftable: true,
      phyDef: (dt2.phyDef ?? 0) - (dt1.phyDef ?? 0),
    };
  }, [umbalaRange]);

  const getUmbalaCalc = () => {
    const onAfterChange = (value: number[]) => {
      setUmbalaRange(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={getFilteredMarks(getMarkKey(0, 6))}
            defaultValue={defaultRange}
            max={6}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          <Divider orientation="left">Materials</Divider>
          {!umbalaDataSource && (
            <div>
              <Alert
                banner
                message="Legend Talisman is non craftable"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(umbalaDataSource ?? {}).map(
              ([key, value]) => ({
                mats: key,
                amount: value,
              })
            )}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {umbalaStatDiff && (
            <ListingCard
              title="Status Increase"
              data={[
                {
                  title: "ATK",
                  value: umbalaStatDiff.attackPercent,
                  suffix: "%",
                },
                {
                  title: "MAX HP",
                  value: umbalaStatDiff.maxHPPercent,
                  suffix: "%",
                },
                {
                  title: "Defense",
                  value: umbalaStatDiff.phyDef,
                  format: true,
                },
              ]}
            />
          )}
        </div>

        {umbalaDataSource && (
          <TradingHouseCalc
            data={[
              {
                name: "Black Dragon Memories",
                amt: umbalaDataSource["Black Dragon Memories"],
              },
              {
                name: "Garnet",
                amt: umbalaDataSource.Garnet,
              },
              {
                name: "Essence",
                amt: umbalaDataSource.Essence,
              },
            ]}
            additionalTotal={umbalaDataSource.Gold}
          />
        )}
      </div>
    );
  };

  // Meluka
  const melukaDataSource: MelukaTableMaterialList | undefined = useMemo(() => {
    const tempSlice = BDMelukaTalismanMatsTable.slice(
      melukaRange[0],
      melukaRange[1]
    );
    const nonCraftable = tempSlice.map((it) => it.craftable).includes(false);
    if (nonCraftable) {
      return;
    }
    const { tempMemories, tempFrag, tempGold, tempGarnet, tempEssence } =
      getSum(tempSlice);

    const temp: MelukaTableMaterialList = {
      "Black Dragon Memories": tempMemories,
      "Meluka Fragment": tempFrag,
      Garnet: tempGarnet,
      Essence: tempEssence,
      Gold: tempGold,
    };
    return temp;
  }, [melukaRange]);

  const melukaStatDiff: BDMelukaTalismanStat | undefined = useMemo(() => {
    const { dt1, dt2 } = getComparedData(
      BDMelukaTalismanStatTable,
      melukaRange[0],
      melukaRange[1]
    );
    if (!dt2) {
      return;
    }
    if (!dt1) {
      return dt2;
    }
    return {
      name: "",
      rarity: ITEM_RARITY.CRAFT,
      maxHPPercent: (dt2.maxHPPercent ?? 0) - (dt1.maxHPPercent ?? 0),
      attackPercent: (dt2.attackPercent ?? 0) - (dt1.attackPercent ?? 0),
      fd: [],
      craftable: true,
      magDef: (dt2.magDef ?? 0) - (dt1.magDef ?? 0),
    };
  }, [melukaRange]);

  const getMelukaCalc = () => {
    const onAfterChange = (value: number[]) => {
      setMelukaRange(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={getFilteredMarks(getMarkKey(0, 6))}
            defaultValue={defaultRange}
            max={6}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          <Divider orientation="left">Materials</Divider>
          {!melukaDataSource && (
            <div>
              <Alert
                banner
                message="Legend Talisman is non craftable"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(melukaDataSource ?? {}).map(
              ([key, value]) => ({
                mats: key,
                amount: value,
              })
            )}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {melukaStatDiff && (
            <ListingCard
              title="Status Increase"
              data={[
                {
                  title: "ATK",
                  value: melukaStatDiff.attackPercent,
                  suffix: "%",
                },
                {
                  title: "MAX HP",
                  value: melukaStatDiff.maxHPPercent,
                  suffix: "%",
                },
                {
                  title: "Magic Defense",
                  value: melukaStatDiff.magDef,
                  format: true,
                },
              ]}
            />
          )}
        </div>

        {melukaDataSource && (
          <TradingHouseCalc
            data={[
              {
                name: "Black Dragon Memories",
                amt: melukaDataSource["Black Dragon Memories"],
              },
              {
                name: "Garnet",
                amt: melukaDataSource.Garnet,
              },
              {
                name: "Essence",
                amt: melukaDataSource.Essence,
              },
            ]}
            additionalTotal={melukaDataSource.Gold}
          />
        )}
      </div>
    );
  };

  // Titanion
  const titanionDataSource: TitanionTableMaterialList | undefined =
    useMemo(() => {
      const tempSlice = BDTitanionTalismanMatsTable.slice(
        titanRange[0],
        titanRange[1]
      );
      const nonCraftable = tempSlice.map((it) => it.craftable).includes(false);
      if (nonCraftable) {
        return;
      }
      const { tempMemories, tempFrag, tempGold, tempGarnet, tempEssence } =
        getSum(tempSlice);

      const temp: TitanionTableMaterialList = {
        "Black Dragon Memories": tempMemories,
        "Titanion Fragment": tempFrag,
        Garnet: tempGarnet,
        Essence: tempEssence,
        Gold: tempGold,
      };
      return temp;
    }, [titanRange]);

  const titanionStatDiff: BDTitanionTalismanStat | undefined = useMemo(() => {
    const { dt1, dt2 } = getComparedData(
      BDTitanionTalismanStatTable,
      titanRange[0],
      titanRange[1]
    );
    if (!dt2) {
      return;
    }
    if (!dt1) {
      return dt2;
    }
    return {
      name: "",
      rarity: ITEM_RARITY.CRAFT,
      maxHPPercent: (dt2.maxHPPercent ?? 0) - (dt1.maxHPPercent ?? 0),
      attackPercent: (dt2.attackPercent ?? 0) - (dt1.attackPercent ?? 0),
      fd: [],
      craftable: true,
      attack: (dt2.attack ?? 0) - (dt1.attack ?? 0),
    };
  }, [titanRange]);

  const getTitanionCalc = () => {
    const onAfterChange = (value: number[]) => {
      setTitanRange(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={getFilteredMarks(getMarkKey(0, 6))}
            defaultValue={defaultRange}
            max={6}
            min={0}
            onChangeComplete={onAfterChange}
          />
        </div>
        <div>
          <Divider orientation="left">Materials</Divider>
          {!titanionDataSource && (
            <div>
              <Alert
                banner
                message="Legend Talisman is non craftable"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(titanionDataSource ?? {}).map(
              ([key, value]) => ({
                mats: key,
                amount: value,
              })
            )}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {titanionStatDiff && (
            <ListingCard
              title="Status Increase"
              data={[
                {
                  title: "ATK",
                  value: titanionStatDiff.attackPercent,
                  suffix: "%",
                },
                {
                  title: "MAX HP",
                  value: titanionStatDiff.maxHPPercent,
                  suffix: "%",
                },
                {
                  title: "ATK",
                  value: titanionStatDiff.attack,
                  format: true,
                },
              ]}
            />
          )}
        </div>

        {titanionDataSource && (
          <TradingHouseCalc
            data={[
              {
                name: "Black Dragon Memories",
                amt: titanionDataSource["Black Dragon Memories"],
              },
              {
                name: "Garnet",
                amt: titanionDataSource.Garnet,
              },
              {
                name: "Essence",
                amt: titanionDataSource.Essence,
              },
            ]}
            additionalTotal={titanionDataSource.Gold}
          />
        )}
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
