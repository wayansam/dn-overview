import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Divider, Select, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import ListingCard, { ItemList } from "../../../components/ListingCard";
import {
  nstgChestAscension,
  nstgChestLabyrinth,
  nstgLabyrinthAscensionMap,
  nstgResonanceMission,
} from "../../../data/stage/StageNSTGData";
import { NSTGChestReward } from "../../../interface/reward.interface";
import { formatGold } from "../../../utils/reward.util";

const { Text } = Typography;

const eraKey = {
  ascension: "Ascension (v180)",
  labyrinth: "Labyrinth (v150)",
};

interface RewardRow {
  mats: string;
  amount: string;
}

const rewardColumns: ColumnsType<RewardRow> = [
  {
    title: "Name",
    dataIndex: "mats",
    render: (_, { mats }) => <Text>{mats}</Text>,
  },
  {
    title: "Amount",
    dataIndex: "amount",
    width: 150,
    render: (_, { amount }) => <Text>{amount}</Text>,
  },
];

const toChestRows = (data: NSTGChestReward): RewardRow[] => {
  const rows: RewardRow[] = [];
  if (data.dragonJadePouch) {
    rows.push({ mats: data.dragonJadePouch, amount: "1" });
  }
  if (data.lunarEclipseCrystal !== undefined) {
    rows.push({
      mats: "Lunar Eclipse Crystal",
      amount: data.lunarEclipseCrystal.toLocaleString(),
    });
  }
  if (data.lunarEclipseRemains !== undefined) {
    rows.push({
      mats: "Lunar Eclipse Remains",
      amount: data.lunarEclipseRemains.toLocaleString(),
    });
  }
  if (data.gold !== undefined) {
    rows.push({ mats: "Gold", amount: formatGold(data.gold) });
  }
  if (data.heroCoins !== undefined) {
    rows.push({ mats: "Hero Coins", amount: data.heroCoins.toLocaleString() });
  }
  if (data.shinyHeroCoins !== undefined) {
    rows.push({
      mats: "Shiny Hero Coin",
      amount: data.shinyHeroCoins.toLocaleString(),
    });
  }
  return rows;
};

const orDash = (val?: number) => (val === undefined ? "-" : val.toLocaleString());

const StageNSTGContent = () => {
  const [selectEra, setSelectEra] = useState<string>(eraKey.ascension);
  const [selectFloor, setSelectFloor] = useState<string>();

  const eraOpt = useMemo(() => {
    return Object.entries(eraKey).map(([_, value]) => ({
      value: value,
      label: value,
    }));
  }, []);

  const eraData = useMemo((): NSTGChestReward[] => {
    switch (selectEra) {
      case eraKey.ascension:
        return nstgChestAscension;
      case eraKey.labyrinth:
        return nstgChestLabyrinth;

      default:
        return [];
    }
  }, [selectEra]);

  useEffect(() => {
    setSelectFloor(eraData[0]?.floor);
  }, [eraData]);

  const floorList = useMemo(() => {
    return eraData.map((it) => ({ label: it.floor, value: it.floor }));
  }, [eraData]);

  const floorIdx = useMemo(() => {
    return eraData.findIndex((it) => it.floor === selectFloor);
  }, [eraData, selectFloor]);

  const selectedData = eraData[floorIdx];

  const chestRows = useMemo((): RewardRow[] => {
    return selectedData ? toChestRows(selectedData) : [];
  }, [selectedData]);

  // Resonance missions only exist on the Ascension floor names
  const resonanceRows = useMemo((): RewardRow[] => {
    return nstgResonanceMission
      .filter((it) => it.floor === selectFloor)
      .map((it) => ({
        mats: `[Resonance] Clear ${it.floor}${
          it.timeLimit ? ` within ${it.timeLimit}` : ""
        }`,
        amount: it.twistedResonanceFragment.toLocaleString(),
      }));
  }, [selectFloor]);

  const mappingList = useMemo((): ItemList[] => {
    return nstgLabyrinthAscensionMap.map((it) => ({
      title: `${it.labyrinth}: `,
      value: it.ascension,
    }));
  }, []);

  const disableMove = useMemo(() => {
    return {
      disablePrev: floorIdx <= 0,
      disableNext: floorIdx < 0 || floorIdx >= eraData.length - 1,
    };
  }, [floorIdx, eraData]);

  const moveOpt = (increase: boolean) => {
    const target = eraData[floorIdx + (increase ? 1 : -1)];
    if (target) {
      setSelectFloor(target.floor);
    }
  };

  const allFloorColumns: ColumnsType<NSTGChestReward> = [
    {
      title: "Difficulty",
      dataIndex: "floor",
      render: (_, { floor }) => (
        <Text strong={floor === selectFloor}>{floor}</Text>
      ),
    },
    {
      title: "Dragon Jade Pouch",
      dataIndex: "dragonJadePouch",
      render: (_, { dragonJadePouch }) => dragonJadePouch ?? "-",
    },
    {
      title: "Lunar Eclipse Crystal/Remains",
      dataIndex: "lunarEclipseCrystal",
      align: "right",
      render: (_, { lunarEclipseCrystal }) => orDash(lunarEclipseCrystal),
    },
    {
      title: "Gold",
      dataIndex: "gold",
      align: "right",
      render: (_, { gold }) => (gold === undefined ? "-" : formatGold(gold)),
    },
    {
      title: "Hero Coins",
      dataIndex: "heroCoins",
      align: "right",
      render: (_, { heroCoins }) => orDash(heroCoins),
    },
    {
      title: "Shiny Hero Coin",
      dataIndex: "shinyHeroCoins",
      align: "right",
      render: (_, { shinyHeroCoins }) => orDash(shinyHeroCoins),
    },
  ];

  return (
    <div>
      <Divider orientation="left">Search</Divider>
      <div style={{ marginBottom: 4 }}>
        Era
        <Divider type="vertical" />
        <Select
          value={selectEra}
          style={{ width: 200 }}
          onChange={(val) => {
            setSelectEra(val);
          }}
          options={eraOpt}
        />
      </div>
      <div style={{ marginBottom: 4 }}>
        Floor
        <Divider type="vertical" />
        <Button
          icon={<LeftOutlined />}
          disabled={disableMove.disablePrev}
          onClick={() => moveOpt(false)}
        />
        <Select
          value={selectFloor}
          style={{ width: 200 }}
          onChange={(val) => {
            setSelectFloor(val);
          }}
          options={floorList}
        />
        <Button
          icon={<RightOutlined />}
          disabled={disableMove.disableNext}
          onClick={() => moveOpt(true)}
        />
      </div>

      <Divider orientation="left">Reward</Divider>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Table
            title={() => "Nightshade Reward Chest"}
            size={"small"}
            rowKey="mats"
            dataSource={chestRows}
            columns={rewardColumns}
            pagination={false}
            bordered
          />
        </div>
        {resonanceRows.length > 0 && (
          <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
            <Table
              title={() => "Resonance Mission (v197)"}
              size={"small"}
              rowKey="mats"
              dataSource={resonanceRows}
              columns={[
                rewardColumns[0],
                { ...rewardColumns[1], title: "Twisted Resonance Fragment" },
              ]}
              pagination={false}
              bordered
            />
          </div>
        )}
      </div>

      <Divider orientation="left">All Floors</Divider>
      <div style={{ marginBottom: 10, overflowX: "auto" }}>
        <Table
          size={"small"}
          rowKey="floor"
          dataSource={eraData}
          columns={allFloorColumns}
          pagination={false}
          bordered
          onRow={(record) => ({
            onClick: () => setSelectFloor(record.floor),
            style: { cursor: "pointer" },
          })}
        />
      </div>

      <Divider orientation="left">General Info</Divider>
      <div>Total difficulty tiers: {eraData.length}</div>
      <div>
        After a clear, the Nightshade Reward Chest needs a Night Shadow
        Starlight Key to open (the key is consumed).
      </div>
      <div>
        Clearing with a Sunset Glow Key also spawns an additional Sunset Glow
        Reward Chest (not on Dimension Labyrinth 2F+). Each chest only opens
        with its own key.
      </div>
      <div>
        Resonance: clearing a higher floor also clears the lower floor
        missions, but time limit missions must be cleared within the time.
      </div>
      <div>"-" means the patch note did not list that reward for the floor.</div>
      <ListingCard title="Labyrinth to Ascension (v160)" data={mappingList} />
    </div>
  );
};

export default StageNSTGContent;
