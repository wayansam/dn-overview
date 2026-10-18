import {
  EyeInvisibleOutlined,
  EyeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Empty,
  Grid,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { getTasksByCategory } from "../data/task/TaskData";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Character } from "../interface/Account.interface";
import {
  resetCharacterActivities,
  saveWeeklyCharacterSetting,
  setActivityCleared,
  setActivityFloor,
} from "../slice/Task.reducer";
import { formatDate } from "../utils/taskStorage.util";
const { Text } = Typography;
const { useBreakpoint } = Grid;

const ACTIVITIES = getTasksByCategory("weeklyCharacter");
type Activity = (typeof ACTIVITIES)[number];

const FLOOR_WIDTH: Record<string, number> = { fissionMaze: 150 };

// Every character as a row, with a checkbox per activity. Excluded
// characters show "-" for that activity. Small screens show one card per
// character instead, with one line per activity.
const WeeklyCharacterTable = () => {
  const dispatch = useAppDispatch();
  const isCompact = !useBreakpoint().md;
  const characters = useAppSelector((state) => state.Character.characters);
  const {
    characterClears,
    characterFloors,
    excludedCharacters,
    hiddenActivities,
  } = useAppSelector((state) => state.Task);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [detailCharacter, setDetailCharacter] = useState<Character>();

  const isExcluded = (activityId: string, characterId: string) =>
    !!excludedCharacters[activityId]?.includes(characterId);

  const getFloorLabel = (activityId: string, characterId: string) => {
    const floor = characterFloors[characterId]?.[activityId];
    return ACTIVITIES.find((item) => item.id === activityId)?.floors?.find(
      (item) => item.value === floor,
    )?.label;
  };

  const shownActivities = ACTIVITIES.filter(
    (activity) => !hiddenActivities.includes(activity.id),
  );

  // `label` shows the activity name next to the box (card layout).
  const renderCheckbox = (
    activity: Activity,
    characterId: string,
    label?: string,
  ) => {
    const date = characterClears[characterId]?.[activity.id];
    return (
      <Tooltip title={date ? `Cleared ${formatDate(date)}` : ""}>
        <Checkbox
          aria-label={activity.name}
          checked={!!date}
          onChange={(e) =>
            dispatch(
              setActivityCleared(characterId, activity.id, e.target.checked),
            )
          }
        >
          {label}
        </Checkbox>
      </Tooltip>
    );
  };

  const renderFloor = (activity: Activity, id: string) =>
    activity.floors && (
      <Select
        size="small"
        allowClear
        showSearch
        optionFilterProp="label"
        placeholder="Floor"
        aria-label={`${activity.name} floor`}
        options={activity.floors}
        value={characterFloors[id]?.[activity.id]}
        onChange={(floor?: string) =>
          dispatch(
            setActivityFloor({
              characterId: id,
              activityId: activity.id,
              floor,
            }),
          )
        }
        popupMatchSelectWidth={false}
        style={{ width: FLOOR_WIDTH[activity.id] ?? 80 }}
      />
    );

  const renderActions = (character: Character) => (
    <Space size={4}>
      <Button size="small" onClick={() => setDetailCharacter(character)}>
        Details
      </Button>
      <Button
        size="small"
        disabled={!characterClears[character.id]}
        onClick={() => dispatch(resetCharacterActivities(character.id))}
      >
        Reset
      </Button>
    </Space>
  );

  const columns: ColumnsType<Character> = [
    { title: "Character", dataIndex: "name", key: "name" },
    ...shownActivities.map((activity): ColumnsType<Character>[number] => ({
      title: activity.name,
      key: activity.id,
      align: "center",
      render: (_, { id }) =>
        isExcluded(activity.id, id) ? (
          "-"
        ) : (
          <Space size={8}>
            {renderCheckbox(activity, id)}
            {renderFloor(activity, id)}
          </Space>
        ),
    })),
    {
      title: "Action",
      key: "action",
      render: (_, character) => renderActions(character),
    },
  ];

  const cards = characters.length ? (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      {characters.map((character) => (
        <Card
          key={character.id}
          size="small"
          title={character.name}
          extra={renderActions(character)}
        >
          {shownActivities.length ? (
            shownActivities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  minHeight: 32,
                }}
              >
                {isExcluded(activity.id, character.id) ? (
                  <>
                    <Text type="secondary">{activity.name}</Text>
                    <Text type="secondary">-</Text>
                  </>
                ) : (
                  <>
                    {renderCheckbox(activity, character.id, activity.name)}
                    {renderFloor(activity, character.id)}
                  </>
                )}
              </div>
            ))
          ) : (
            <Text type="secondary">Every activity is hidden</Text>
          )}
        </Card>
      ))}
    </Space>
  ) : (
    <Empty description="No character yet, add one in the Character screen" />
  );

  return (
    <section aria-label="Weekly [Character]" style={{ marginBottom: 24 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text strong>Weekly [Character]</Text>
        <Button
          icon={<SettingOutlined />}
          onClick={() => setIsCustomizeOpen(true)}
        >
          Customize
        </Button>
      </Space>
      {isCompact ? (
        cards
      ) : (
        <Table
          columns={columns}
          dataSource={characters}
          rowKey="id"
          scroll={{ x: true }}
          pagination={false}
          locale={{
            emptyText: "No character yet, add one in the Character screen",
          }}
          size={"small"}
        />
      )}
      {isCustomizeOpen && (
        <CustomizeModal onClose={() => setIsCustomizeOpen(false)} />
      )}
      <Modal
        open={!!detailCharacter}
        title={detailCharacter?.name}
        footer={null}
        onCancel={() => setDetailCharacter(undefined)}
      >
        {detailCharacter && (
          <Descriptions size="small" column={1} bordered>
            {ACTIVITIES.map((activity) => (
              <Descriptions.Item key={activity.id} label={activity.name}>
                {isExcluded(activity.id, detailCharacter.id) ? (
                  <Text type="secondary">Excluded</Text>
                ) : (
                  <>
                    {formatDate(
                      characterClears[detailCharacter.id]?.[activity.id],
                    )}
                    {getFloorLabel(activity.id, detailCharacter.id) && (
                      <Text type="secondary">
                        {" "}
                        ({getFloorLabel(activity.id, detailCharacter.id)})
                      </Text>
                    )}
                  </>
                )}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Modal>
    </section>
  );
};

// Mounted only while open, so it always starts from the saved exclusions.
const CustomizeModal = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const characters = useAppSelector((state) => state.Character.characters);
  const { excludedCharacters, hiddenActivities } = useAppSelector(
    (state) => state.Task,
  );
  // Deleted characters are dropped from the lists.
  const [excluded, setExcluded] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      ACTIVITIES.map((activity) => [
        activity.id,
        (excludedCharacters[activity.id] ?? []).filter((id) =>
          characters.some((item) => item.id === id),
        ),
      ]),
    ),
  );
  const [hidden, setHidden] = useState<string[]>(hiddenActivities);
  const options = characters.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const setActivityExcluded = (activityId: string, ids: string[]) =>
    setExcluded({ ...excluded, [activityId]: ids });

  const toggleHidden = (activityId: string) =>
    setHidden(
      hidden.includes(activityId)
        ? hidden.filter((id) => id !== activityId)
        : [...hidden, activityId],
    );

  return (
    <Modal
      open
      title="Customize Weekly Character"
      okText="Save"
      onOk={() => {
        dispatch(
          saveWeeklyCharacterSetting({
            excludedCharacters: excluded,
            // Keep the table's column order.
            hiddenActivities: ACTIVITIES.map((item) => item.id).filter((id) =>
              hidden.includes(id),
            ),
          }),
        );
        onClose();
      }}
      onCancel={onClose}
    >
      <Text type="secondary">
        Excluded characters show "-" instead of a checkbox. Hidden activities
        are left out of the table.
      </Text>
      <Space
        direction="vertical"
        size={16}
        style={{ width: "100%", marginTop: 12 }}
      >
        {ACTIVITIES.map((activity) => {
          const isHidden = hidden.includes(activity.id);
          const ids = excluded[activity.id] ?? [];
          return (
            <div key={activity.id} data-activity={activity.id}>
              <Space
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <label htmlFor={`exclude-${activity.id}`}>
                  {activity.name}: excluded characters
                  {isHidden && <Text type="secondary"> (hidden)</Text>}
                </label>
                <Space size={0}>
                  <Button
                    size="small"
                    type="link"
                    disabled={
                      !characters.length || ids.length === characters.length
                    }
                    onClick={() =>
                      setActivityExcluded(
                        activity.id,
                        characters.map((item) => item.id),
                      )
                    }
                  >
                    Add All
                  </Button>
                  <Button
                    size="small"
                    type="link"
                    icon={isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    onClick={() => toggleHidden(activity.id)}
                  >
                    {isHidden ? "Show" : "Hide"}
                  </Button>
                </Space>
              </Space>
              <Select
                id={`exclude-${activity.id}`}
                mode="multiple"
                allowClear
                maxTagCount="responsive"
                placeholder="None excluded"
                optionFilterProp="label"
                options={options}
                value={ids}
                onChange={(value: string[]) =>
                  setActivityExcluded(activity.id, value)
                }
                style={{ width: "100%" }}
              />
            </div>
          );
        })}
      </Space>
    </Modal>
  );
};

export default WeeklyCharacterTable;
