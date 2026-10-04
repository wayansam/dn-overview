import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Divider, Select, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import ListingCard, { ItemList } from "../../../components/ListingCard";
import {
  fmErosionAscension,
  fmErosionLabyrinth,
  fmLabyrinthAscensionMap,
  fmStageClearLabyrinth,
  fmWeeklyConquest,
} from "../../../data/stage/StageFissionMazeData";
import {
  FissionMazeErosionReward,
  FissionMazeRangeReward,
} from "../../../interface/reward.interface";

const { Text } = Typography;

const eraKey = {
  ascension: "Ascension (v180)",
  labyrinth: "Labyrinth (v81)",
};

interface RewardRow {
  mats: string;
  amount: string;
}

const formatGold = (copper: number) => {
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${g.toLocaleString()}g ${pad(s)}s ${pad(c)}c`;
};

const formatRange = (min: number, max?: number) =>
  max === undefined
    ? min.toLocaleString()
    : `${min.toLocaleString()} ~ ${max.toLocaleString()}`;

const toRows = (list: FissionMazeRangeReward[]): RewardRow[] =>
  list.map((it) => ({ mats: it.name, amount: formatRange(it.min, it.max) }));

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

const StageFissionMazeContent = () => {
  const [selectEra, setSelectEra] = useState<string>(eraKey.ascension);
  const [selectFloor, setSelectFloor] = useState<string>();

  const eraOpt = useMemo(() => {
    return Object.entries(eraKey).map(([_, value]) => ({
      value: value,
      label: value,
    }));
  }, []);

  const eraData = useMemo((): FissionMazeErosionReward[] => {
    switch (selectEra) {
      case eraKey.ascension:
        return fmErosionAscension;
      case eraKey.labyrinth:
        return fmErosionLabyrinth;

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

  const erosionBoxRows = useMemo((): RewardRow[] => {
    if (!selectedData) {
      return [];
    }
    const rows: RewardRow[] = [
      { mats: "Gold", amount: formatGold(selectedData.gold) },
      {
        mats: "Erosion Fragment",
        amount: selectedData.erosionFragment.toLocaleString(),
      },
    ];
    if (selectedData.concentratedErosionFragment) {
      const { min, max } = selectedData.concentratedErosionFragment;
      rows.push({
        mats: "Concentrated Erosion Fragment",
        amount: formatRange(min, max),
      });
    }
    return rows;
  }, [selectedData]);

  const stageClear = useMemo(() => {
    return fmStageClearLabyrinth.find((it) => it.floor === selectFloor);
  }, [selectFloor]);

  const firstConcentrated = useMemo(() => {
    return eraData.find((it) => it.concentratedErosionFragment !== undefined);
  }, [eraData]);

  const mappingList = useMemo((): ItemList[] => {
    return fmLabyrinthAscensionMap.map((it) => ({
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

  const allFloorColumns: ColumnsType<FissionMazeErosionReward> = [
    {
      title: "Difficulty",
      dataIndex: "floor",
      render: (_, { floor }) => (
        <Text strong={floor === selectFloor}>{floor}</Text>
      ),
    },
    {
      title: "Gold",
      dataIndex: "gold",
      align: "right",
      render: (_, { gold }) => <Text>{formatGold(gold)}</Text>,
    },
    {
      title: "Erosion Fragment",
      dataIndex: "erosionFragment",
      align: "right",
    },
    {
      title: "Concentrated Erosion Fragment",
      dataIndex: "concentratedErosionFragment",
      align: "right",
      render: (_, { concentratedErosionFragment: cef }) =>
        cef ? formatRange(cef.min, cef.max) : "-",
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
          style={{ width: 160 }}
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
            title={() => "Erosion Reward Box"}
            size={"small"}
            rowKey="mats"
            dataSource={erosionBoxRows}
            columns={rewardColumns}
            pagination={false}
            bordered
          />
        </div>
        {stageClear && (
          <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
            <Table
              title={() => "Stage Clear"}
              size={"small"}
              rowKey="mats"
              dataSource={[
                ...toRows(stageClear.goldenBox).map((it) => ({
                  ...it,
                  mats: `[Golden Box] ${it.mats}`,
                })),
                ...toRows(stageClear.silverBox).map((it) => ({
                  ...it,
                  mats: `[Silver Box] ${it.mats}`,
                })),
              ]}
              columns={rewardColumns}
              pagination={false}
              bordered
            />
          </div>
        )}
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Table
            title={() => "Weekly Conquest (v81) (Removed)"}
            size={"small"}
            rowKey="mats"
            dataSource={toRows(fmWeeklyConquest)}
            columns={rewardColumns}
            pagination={false}
            bordered
          />
        </div>
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
        First floor with Concentrated Erosion Fragment:{" "}
        {firstConcentrated?.floor ?? "-"}
      </div>
      <div>
        Erosion Reward Box drops at the final stage on an Erosion mode clear.
      </div>
      <ListingCard title="Labyrinth to Ascension (v160)" data={mappingList} />
    </div>
  );
};

export default StageFissionMazeContent;
