import { HistoryOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Empty,
  Modal,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { getTaskById, getTasksByCategory } from "../data/task/TaskData";
import { useAppSelector } from "../hooks";
import { WeeklyHistory } from "../interface/Task.interface";
import { formatDate } from "../utils/taskStorage.util";
import {
  formatRewardAmount,
  summarizeWeeklyRewards,
} from "../utils/weeklyReward.util";
const { Text } = Typography;

const ACTIVITIES = getTasksByCategory("weeklyCharacter");

const lineStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  minHeight: 24,
};

// "Last Week" button: what was cleared in the week before the latest reset.
const LastWeekSummary = () => {
  const lastWeek = useAppSelector((state) => state.Task.lastWeek);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip
        title={lastWeek ? "" : "Saved at the next weekly reset (Sat 09:00)"}
      >
        <Button
          icon={<HistoryOutlined />}
          disabled={!lastWeek}
          onClick={() => setIsOpen(true)}
        >
          Last Week
        </Button>
      </Tooltip>
      {isOpen && lastWeek && (
        <LastWeekModal history={lastWeek} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};

const LastWeekModal = ({
  history,
  onClose,
}: {
  history: WeeklyHistory;
  onClose: () => void;
}) => {
  const { characters, groups } = useAppSelector((state) => state.Character);
  // Deleted IDs / characters show as "-".
  const groupName = (id?: string) =>
    groups.find((item) => item.id === id)?.name;
  const characterName = (id?: string) =>
    characters.find((item) => item.id === id)?.name;

  const clearedCharacters = characters.filter(
    ({ id }) => history.characterClears[id],
  );
  const rewards = summarizeWeeklyRewards(characters, {
    characterClears: history.characterClears,
    characterFloors: history.characterFloors,
    excludedCharacters: {},
    hiddenActivities: [],
  }).rows.filter(({ cleared }) => cleared.max > 0);

  const floorLabel = (characterId: string, activityId: string) => {
    const floor = history.characterFloors[characterId]?.[activityId];
    return ACTIVITIES.find((item) => item.id === activityId)?.floors?.find(
      (item) => item.value === floor,
    )?.label;
  };

  return (
    <Modal
      open
      title={`Last Week: ${formatDate(history.weekStart)} - ${formatDate(
        history.weekEnd,
      )}`}
      footer={null}
      onCancel={onClose}
    >
      <Text type="secondary" style={{ fontSize: 12 }}>
        Saturday 09:00 to Saturday 09:00 server time.
      </Text>

      <section aria-label="Last week account">
        <Divider orientation="left" style={{ margin: "12px 0 8px" }}>
          Weekly [Account] ({history.accountClears.length})
        </Divider>
        {history.accountClears.length ? (
          history.accountClears.map((item, index) => {
            const detail = [
              groupName(item.groupId),
              characterName(item.characterId),
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <div key={index} style={lineStyle}>
                <Space direction="vertical" size={0}>
                  <Text>{getTaskById(item.taskId)?.name}</Text>
                  {detail && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {detail}
                    </Text>
                  )}
                </Space>
                <Text type="secondary">{formatDate(item.clearedAt)}</Text>
              </div>
            );
          })
        ) : (
          <Text type="secondary">Nothing cleared</Text>
        )}
      </section>

      <section aria-label="Last week character">
        <Divider orientation="left" style={{ margin: "12px 0 8px" }}>
          Weekly [Character]
        </Divider>
        {clearedCharacters.length ? (
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {clearedCharacters.map((character) => (
              <div key={character.id} data-character={character.name}>
                <Text strong>{character.name}</Text>
                {ACTIVITIES.filter(
                  (activity) =>
                    history.characterClears[character.id][activity.id],
                ).map((activity) => {
                  const floor = floorLabel(character.id, activity.id);
                  return (
                    <div key={activity.id} style={lineStyle}>
                      <Text>
                        {activity.name}
                        {floor && <Text type="secondary"> ({floor})</Text>}
                      </Text>
                      <Text type="secondary">
                        {formatDate(
                          history.characterClears[character.id][activity.id],
                        )}
                      </Text>
                    </div>
                  );
                })}
              </div>
            ))}
          </Space>
        ) : (
          <Text type="secondary">Nothing cleared</Text>
        )}
      </section>

      <section aria-label="Last week rewards">
        <Divider orientation="left" style={{ margin: "12px 0 8px" }}>
          Rewards earned
        </Divider>
        {rewards.length ? (
          rewards.map(({ name, cleared }) => (
            <div key={name} style={lineStyle}>
              <Text>{name}</Text>
              <Text strong style={{ whiteSpace: "nowrap" }}>
                {formatRewardAmount(name, cleared)}
              </Text>
            </div>
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No Fission Maze or Ark of Transcendence clear with a floor"
          />
        )}
      </section>
    </Modal>
  );
};

export default LastWeekSummary;
