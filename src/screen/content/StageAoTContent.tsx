import { Button, Divider, Select, Table, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import ListingCard, { ItemList } from "../../components/ListingCard";
import {
  aotRewardS2FutureInit,
  aotRewardS2FutureWeek,
  aotRewardS3PastInit,
  aotRewardS3PastWeek,
} from "../../data/StageAoTData";
import { StageAotReward } from "../../interface/reward.interface";
import { getCustomColumnResource } from "../../utils/common.util";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";

const floorPref = {
  first: "First",
  coins: "Coins",
  shinyCoins: "Shiny Coins",
  last: "Last",
};
const seasonKey = {
  s3Past: "Season 3 [Past]",
  s2Future: "Season 2 [Future]",
};

const StageAoTContent = () => {
  const [selectSeason, setSelectSeason] = useState<string>();
  const [selectedPref, setSelectedPref] = useState<string>(floorPref.first);
  const [selectFloor, setSelectFloor] = useState<number>();

  const seasonOpt = useMemo(() => {
    return Object.entries(seasonKey).map(([_, value]) => ({
      value: value,
      label: value,
    }));
  }, [seasonKey]);

  const prefOpt = useMemo(() => {
    return Object.entries(floorPref).map(([_, value]) => ({
      value: value,
      label: value,
    }));
  }, [seasonKey]);

  useEffect(() => {
    if (seasonOpt.length > 0) setSelectSeason(seasonOpt[0].label);
  }, [seasonOpt]);

  const seasonData = useMemo((): {
    first: StageAotReward[];
    weekly: StageAotReward[];
  } => {
    switch (selectSeason) {
      case seasonKey.s2Future:
        return { first: aotRewardS2FutureInit, weekly: aotRewardS2FutureWeek };
      case seasonKey.s3Past:
        return { first: aotRewardS3PastInit, weekly: aotRewardS3PastWeek };

      default:
        return { first: [], weekly: [] };
    }
  }, [selectSeason]);

  const foundC = useMemo(() => {
    return seasonData.weekly.find(
      (item) => item.rewards["Hero Coins"] !== undefined
    );
  }, [seasonData.weekly]);

  const foundSC = useMemo(() => {
    return seasonData.weekly.find(
      (item) => item.rewards["Shiny Hero Coins"] !== undefined
    );
  }, [seasonData.weekly]);

  const titleList = useMemo((): ItemList[] => {
    return seasonData.first
      .filter((item) => item.title !== undefined)
      .map((it) => ({
        title: `Floor ${it.floor}: `,
        value: it.title,
      }));
  }, [seasonData.first]);

  const floorList = useMemo(() => {
    if (seasonData.first.length < 1) {
      setSelectFloor(undefined);
      return [];
    }

    switch (selectedPref) {
      case floorPref.first:
        setSelectFloor(1);
        break;
      case floorPref.coins:
        setSelectFloor(foundC ? foundC.floor : 1);
        break;
      case floorPref.shinyCoins:
        setSelectFloor(foundSC ? foundSC.floor : 1);
        break;
      case floorPref.last:
        setSelectFloor(seasonData.first.length);
        break;

      default:
        setSelectFloor(undefined);
        break;
    }
    return Array.from({ length: seasonData.first.length }, (_, k) => k + 1).map(
      (item) => ({
        label: item,
        value: item,
      })
    );
  }, [seasonData.first, selectedPref, foundC, foundSC]);

  const selectedSeasonData = useMemo((): {
    first?: StageAotReward;
    weekly?: StageAotReward;
  } => {
    return {
      first: seasonData.first.find((it) => it.floor === selectFloor),
      weekly: seasonData.weekly.find((it) => it.floor === selectFloor),
    };
  }, [seasonData, selectFloor]);

  const disableMove = useMemo(() => {
    return {
      disablePrev: !selectFloor || selectFloor <= 1,
      disableNext: !selectFloor || selectFloor >= floorList.length,
    };
  }, [selectFloor, floorList]);

  const moveOpt = (increase: boolean) => {
    if (!selectFloor) {
      return;
    }
    setSelectFloor(selectFloor + (increase ? 1 : -1));
  };

  return (
    <div>
      <Divider orientation="left">Search</Divider>
      <div style={{ marginBottom: 4 }}>
        Season
        <Divider type="vertical" />
        <Select
          value={selectSeason}
          style={{ width: 200 }}
          onChange={(val) => {
            setSelectSeason(val);
          }}
          options={seasonOpt}
        />
      </div>
      <div style={{ marginBottom: 4 }}>
        Preference
        <Divider type="vertical" />
        <Select
          value={selectedPref}
          style={{ width: 200 }}
          onChange={(val) => {
            setSelectedPref(val);
          }}
          options={prefOpt}
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
          style={{ width: 100 }}
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
            title={() => "First Clear"}
            size={"small"}
            dataSource={Object.entries(selectedSeasonData.first?.rewards ?? {})
              .filter(([_, value]) => {
                if (typeof value === "number") {
                  return value !== 0;
                }
              })
              .map(([key, value]) => ({
                mats: key,
                amount: value,
              }))}
            columns={getCustomColumnResource({ customMatsTitle: "Name" })}
            pagination={false}
            bordered
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Table
            title={() => "Weekly Clear"}
            size={"small"}
            dataSource={Object.entries(selectedSeasonData.weekly?.rewards ?? {})
              .filter(([_, value]) => {
                if (typeof value === "number") {
                  return value !== 0;
                }
              })
              .map(([key, value]) => ({
                mats: key,
                amount: value,
              }))}
            columns={getCustomColumnResource({ customMatsTitle: "Name" })}
            pagination={false}
            bordered
          />
        </div>
      </div>
      <Divider orientation="left">General Info</Divider>
      <div>First floor with Hero Coins: {foundC?.floor ?? "-"}</div>
      <div>First floor with Shiny Hero Coins: {foundSC?.floor ?? "-"}</div>
      <ListingCard title="First Clear Title" data={titleList} />
    </div>
  );
};

export default StageAoTContent;
