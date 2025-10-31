import { Divider, Select, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { CharacterInGameData } from "../../interface/Account.interface";
import ReleaseNotes from "../../components/ReleaseNotes";
import { useState } from "react";
import {
  columnsResource,
  getCustomColumnResource,
} from "../../utils/common.util";
const { Text } = Typography;

const seasonOpt = [
  {
    label: "New",
    value: "new",
  },
  {
    label: "Old",
    value: "old",
  },
];
const StageAoTContent = () => {
  const [selectSeason, setSelectSeason] = useState<string>(seasonOpt[0].value);
  const [selectFloor, setSelectFloor] = useState<number>(1);
  return (
    <div>
      <Divider orientation="left">Settings</Divider>
      <div style={{ marginBottom: 4 }}>
        Season
        <Divider type="vertical" />
        <Select
          defaultValue={selectSeason}
          style={{ width: 200 }}
          onChange={(val) => {
            setSelectSeason(val);
          }}
          options={seasonOpt}
        />
      </div>
      <div style={{ marginBottom: 4 }}>
        Floor
        <Divider type="vertical" />
        <Select
          defaultValue={selectFloor}
          style={{ width: 200 }}
          onChange={(val) => {
            setSelectFloor(val);
          }}
          options={[
            { label: 1, value: 1 },
            { label: 2, value: 2 },
            { label: 3, value: 3 },
          ]}
        />
      </div>

      <Divider orientation="left">Reward</Divider>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Table
            title={() => "First Clear"}
            size={"small"}
            dataSource={Object.entries({ test: 1 })
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
            dataSource={Object.entries({ test: 1 })
              .filter(([_, value]) => {
                if (typeof value === "number") {
                  return value !== 0;
                }
              })
              .map(([key, value]) => ({
                mats: key,
                amount: value,
              }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
        </div>
      </div>
      <Divider orientation="left">General Info</Divider>
    </div>
  );
};

export default StageAoTContent;
