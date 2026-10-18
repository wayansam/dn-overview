import { EyeOutlined, SettingOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Modal,
  Progress,
  Space,
  Table,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { AOT_WEEKLY, FISSION_MAZE_WEEKLY } from "../data/task/TaskData";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setShownRewards } from "../slice/Task.reducer";
import {
  WeeklyRewardRow,
  formatRewardAmount as formatAmount,
  getAllRewardNames,
  pickRewardRows,
  summarizeWeeklyRewards,
} from "../utils/weeklyReward.util";
const { Text } = Typography;

// Rewards from the Weekly [Character] floors: what the ticked activities
// gave so far, and the total once everything is cleared.
const WeeklyRewardSummary = () => {
  const characters = useAppSelector((state) => state.Character.characters);
  const task = useAppSelector((state) => state.Task);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { rows, runCount, clearedCount } = summarizeWeeklyRewards(
    characters,
    task,
  );
  const isCustomized = !!task.shownRewards;
  const shownRows = pickRewardRows(rows, task.shownRewards, showAll);

  const columns: ColumnsType<WeeklyRewardRow> = [
    { title: "Item", dataIndex: "name", key: "name" },
    {
      title: "Cleared",
      key: "cleared",
      align: "right",
      render: (_, { name, cleared }) => formatAmount(name, cleared),
    },
    {
      title: "Total",
      key: "total",
      align: "right",
      render: (_, { name, total }) => (
        <Text strong>{formatAmount(name, total)}</Text>
      ),
    },
  ];

  const emptyText = !runCount
    ? "Pick a Fission Maze or Ark of Transcendence floor in Weekly [Character] to see the rewards"
    : "No resource selected, use Customize or Show all";

  return (
    <section aria-label="Weekly Rewards" style={{ marginBottom: 24 }}>
      <Space
        wrap
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Space size={12} wrap>
          <Text strong>Weekly Rewards</Text>
          {runCount > 0 && (
            <Space size={8}>
              <Text type="secondary">
                {clearedCount}/{runCount} cleared
              </Text>
              <Progress
                percent={Math.round((clearedCount / runCount) * 100)}
                size="small"
                showInfo={false}
                style={{ width: 100, margin: 0 }}
              />
            </Space>
          )}
        </Space>
        <Space size={8} wrap>
          {isCustomized && (
            <Button icon={<EyeOutlined />} onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show selected" : "Show all"}
            </Button>
          )}
          <Button
            icon={<SettingOutlined />}
            onClick={() => setIsCustomizeOpen(true)}
          >
            Customize
          </Button>
        </Space>
      </Space>
      <Table
        columns={columns}
        dataSource={shownRows}
        rowKey="name"
        scroll={{ x: true }}
        pagination={false}
        size="small"
        locale={{ emptyText }}
      />
      <Text
        type="secondary"
        style={{ display: "block", marginTop: 8, fontSize: 12 }}
      >
        From the floor picked for each character. Fission Maze:{" "}
        {FISSION_MAZE_WEEKLY.label}. Ark of Transcendence: {AOT_WEEKLY.label}.
        Excluded characters, hidden activities and Nightmare are not counted.
      </Text>
      {isCustomizeOpen && (
        <CustomizeModal
          onClose={() => setIsCustomizeOpen(false)}
          onSaved={() => setShowAll(false)}
        />
      )}
    </section>
  );
};

interface CustomizeModalProps {
  onClose: () => void;
  onSaved: () => void;
}

// Mounted only while open, so it always starts from the saved selection.
const CustomizeModal = ({ onClose, onSaved }: CustomizeModalProps) => {
  const dispatch = useAppDispatch();
  const shownRewards = useAppSelector((state) => state.Task.shownRewards);
  const allNames = getAllRewardNames();
  // Not customized yet: start with everything ticked.
  const [selected, setSelected] = useState<string[]>(shownRewards ?? allNames);

  return (
    <Modal
      open
      title="Customize Weekly Rewards"
      okText="Save"
      onOk={() => {
        dispatch(setShownRewards(selected));
        onSaved();
        onClose();
      }}
      onCancel={onClose}
    >
      <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <Text type="secondary">
          Ticked resources are always shown, even at 0.
        </Text>
        <Space size={0}>
          <Button
            size="small"
            type="link"
            disabled={selected.length === allNames.length}
            onClick={() => setSelected(allNames)}
          >
            Select all
          </Button>
          <Button
            size="small"
            type="link"
            disabled={!selected.length}
            onClick={() => setSelected([])}
          >
            Clear
          </Button>
        </Space>
      </Space>
      <Checkbox.Group
        value={selected}
        onChange={(value) => setSelected(value as string[])}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginTop: 12,
        }}
        options={allNames.map((name) => ({ label: name, value: name }))}
      />
    </Modal>
  );
};

export default WeeklyRewardSummary;
