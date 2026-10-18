import { CheckOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Divider,
  Progress,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { TAB_KEY } from "../../constants/Common.constants";
import { getTaskById, getTasksByCategory } from "../../data/task/TaskData";
import { useAppDispatch, useAppSelector } from "../../hooks";
import useTabNavigation from "../../hooks/useTabNavigation";
import { markTaskDone } from "../../slice/Task.reducer";
import {
  formatRewardAmount,
  pickRewardRows,
  summarizeWeeklyRewards,
} from "../../utils/weeklyReward.util";
const { Text } = Typography;

const ACTIVITIES = getTasksByCategory("weeklyCharacter");
// Pending account tasks listed before "+N more".
const PENDING_LIMIT = 5;

const percent = (done: number, total: number) =>
  total ? Math.round((done / total) * 100) : 0;

// Weekly progress for the General dashboard. Managing tasks stays in the
// Task tab.
const TaskWidget = () => {
  const dispatch = useAppDispatch();
  const openTab = useTabNavigation();
  const { characters, groups } = useAppSelector((state) => state.Character);
  const task = useAppSelector((state) => state.Task);
  const { entries, characterClears, excludedCharacters, hiddenActivities } =
    task;
  // Only the resources set to always show in the Task tab's Customize.
  const rewardRows = task.shownRewards
    ? pickRewardRows(
        summarizeWeeklyRewards(characters, task).rows,
        task.shownRewards,
        false,
      )
    : [];

  const accountTasks = entries.filter(
    (item) => item.category === "weeklyAccount",
  );
  const pending = accountTasks.filter((item) => !item.lastCleared);
  const doneCount = accountTasks.length - pending.length;

  const describe = (groupId?: string, characterId?: string) =>
    [
      groups.find((item) => item.id === groupId)?.name,
      characters.find((item) => item.id === characterId)?.name,
    ]
      .filter(Boolean)
      .join(" · ");

  // Characters not excluded from each shown activity, and how many ticked it.
  const activityProgress = ACTIVITIES.filter(
    (activity) => !hiddenActivities.includes(activity.id),
  ).map((activity) => {
    const eligible = characters.filter(
      ({ id }) => !excludedCharacters[activity.id]?.includes(id),
    );
    return {
      ...activity,
      total: eligible.length,
      done: eligible.filter(({ id }) => characterClears[id]?.[activity.id])
        .length,
    };
  });

  return (
    <Card
      size="small"
      title="Tasks"
      extra={
        <Button
          size="small"
          type="link"
          onClick={() => openTab(TAB_KEY.mainTask)}
        >
          View all
        </Button>
      }
    >
      <section aria-label="Weekly [Account] progress">
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Text strong>Weekly [Account]</Text>
          <Text type="secondary">
            {doneCount}/{accountTasks.length} done
          </Text>
        </Space>
        {accountTasks.length ? (
          <>
            <Progress
              percent={percent(doneCount, accountTasks.length)}
              size="small"
              showInfo={false}
            />
            {pending.length ? (
              pending.slice(0, PENDING_LIMIT).map((item) => {
                const detail = describe(item.groupId, item.characterId);
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      minHeight: 32,
                    }}
                  >
                    <Space direction="vertical" size={0}>
                      <Text>{getTaskById(item.taskId)?.name}</Text>
                      {detail && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {detail}
                        </Text>
                      )}
                    </Space>
                    <Tooltip title="Done">
                      <Button
                        size="small"
                        type="primary"
                        aria-label="Done"
                        icon={<CheckOutlined />}
                        onClick={() => dispatch(markTaskDone(item.id))}
                      />
                    </Tooltip>
                  </div>
                );
              })
            ) : (
              <Text type="success">All done</Text>
            )}
            {pending.length > PENDING_LIMIT && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{pending.length - PENDING_LIMIT} more in the Task tab
              </Text>
            )}
          </>
        ) : (
          <Text type="secondary" style={{ display: "block" }}>
            No task yet, add one in the Task tab
          </Text>
        )}
      </section>

      <Divider style={{ margin: "12px 0" }} />

      <section aria-label="Weekly [Character] progress">
        <Text strong>Weekly [Character]</Text>
        {!characters.length ? (
          <Text type="secondary" style={{ display: "block" }}>
            No character yet, add one in the Character screen
          </Text>
        ) : !activityProgress.length ? (
          <Text type="secondary" style={{ display: "block" }}>
            Every activity is hidden
          </Text>
        ) : (
          activityProgress.map((activity) => (
            <div key={activity.id} data-activity={activity.id}>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Text>{activity.name}</Text>
                <Text type="secondary">
                  {activity.done}/{activity.total}
                </Text>
              </Space>
              <Progress
                percent={percent(activity.done, activity.total)}
                size="small"
                showInfo={false}
                status={
                  activity.total && activity.done === activity.total
                    ? "success"
                    : "normal"
                }
              />
            </div>
          ))
        )}
      </section>

      <Divider style={{ margin: "12px 0" }} />

      <section aria-label="Weekly Rewards summary">
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Text strong>Weekly Rewards</Text>
          {rewardRows.length > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Cleared / Total
            </Text>
          )}
        </Space>
        {!task.shownRewards ? (
          <Text type="secondary" style={{ display: "block" }}>
            Pick the rewards to show with Customize in the Task tab
          </Text>
        ) : !rewardRows.length ? (
          <Text type="secondary" style={{ display: "block" }}>
            No reward set to always show
          </Text>
        ) : (
          rewardRows.map(({ name, cleared, total }) => (
            <div
              key={name}
              data-reward={name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                minHeight: 24,
              }}
            >
              <Text>{name}</Text>
              <Text style={{ whiteSpace: "nowrap" }}>
                {formatRewardAmount(name, cleared)} /{" "}
                <Text strong>{formatRewardAmount(name, total)}</Text>
              </Text>
            </div>
          ))
        )}
      </section>
    </Card>
  );
};

export default TaskWidget;
