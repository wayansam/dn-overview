import {
  CheckOutlined,
  DeleteOutlined,
  PlusOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import {
  Button,
  Grid,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { ComponentProps, ReactNode, useState } from "react";
import TaskFormModal from "../../../components/TaskFormModal";
import WeeklyCharacterTable from "../../../components/WeeklyCharacterTable";
import ServerTime from "../../../components/ServerTime";
import WeeklyRewardSummary from "../../../components/WeeklyRewardSummary";
import { TASK_LIMIT } from "../../../constants/Task.constants";
import { getTaskById } from "../../../data/task/TaskData";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { TaskCategory, TaskEntry } from "../../../interface/Task.interface";
import {
  deleteTask,
  markTaskDone,
  resetTask,
} from "../../../slice/Task.reducer";
import { formatDate } from "../../../utils/taskStorage.util";
const { Text } = Typography;
const { useBreakpoint } = Grid;

type TaskColumn = ColumnsType<TaskEntry>[number];

interface TaskTableProps {
  category: TaskCategory;
  title: string;
}

const TaskTable = ({ category, title }: TaskTableProps) => {
  const dispatch = useAppDispatch();
  // Small screens show only Name and Action: ID, character and last cleared
  // are listed under the name, and the actions become icon buttons.
  const isCompact = !useBreakpoint().md;
  const entries = useAppSelector((state) => state.Task.entries).filter(
    (item) => item.category === category,
  );
  const { characters, groups } = useAppSelector((state) => state.Character);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const isFull = entries.length >= TASK_LIMIT;

  // A deleted ID / character shows as "-".
  const getGroupName = (groupId?: string) =>
    groups.find((item) => item.id === groupId)?.name ?? "-";
  const getCharacterName = (characterId?: string) =>
    characters.find((item) => item.id === characterId)?.name ?? "-";

  const nameColumn: TaskColumn = {
    title: "Name",
    key: "name",
    render: (_, { taskId, groupId, characterId, lastCleared }) => {
      const name = getTaskById(taskId)?.name ?? taskId;
      if (!isCompact) return name;
      return (
        <Space direction="vertical" size={0}>
          <Text>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getGroupName(groupId)} · {getCharacterName(characterId)}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Last cleared: {formatDate(lastCleared)}
          </Text>
        </Space>
      );
    },
  };

  // Icon-only on small screens; the aria-label keeps the button named.
  const actionButton = (
    label: string,
    icon: ReactNode,
    props: ComponentProps<typeof Button>,
  ) => (
    <Tooltip title={isCompact ? label : ""}>
      <Button
        size="small"
        aria-label={label}
        icon={isCompact ? icon : undefined}
        {...props}
      >
        {!isCompact && label}
      </Button>
    </Tooltip>
  );

  const actionColumn: TaskColumn = {
    title: "Action",
    key: "action",
    render: (_, { id, lastCleared }) => (
      <Space size={isCompact ? 4 : 8} wrap={!isCompact}>
        {actionButton("Done", <CheckOutlined />, {
          type: "primary",
          onClick: () => dispatch(markTaskDone(id)),
        })}
        {actionButton("Reset", <UndoOutlined />, {
          disabled: !lastCleared,
          onClick: () => dispatch(resetTask(id)),
        })}
        <Popconfirm
          title="Delete this task?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => dispatch(deleteTask(id))}
        >
          {/* Wrapped so the Popconfirm attaches to the button, not the tooltip. */}
          <span>
            {actionButton("Delete", <DeleteOutlined />, { danger: true })}
          </span>
        </Popconfirm>
      </Space>
    ),
  };

  const columns: ColumnsType<TaskEntry> = isCompact
    ? [nameColumn, actionColumn]
    : [
        nameColumn,
        {
          title: "ID",
          key: "groupId",
          render: (_, { groupId }) => getGroupName(groupId),
        },
        {
          title: "Character",
          key: "characterId",
          render: (_, { characterId }) => getCharacterName(characterId),
        },
        {
          title: "Last Cleared",
          key: "lastCleared",
          render: (_, { lastCleared }) => formatDate(lastCleared),
        },
        actionColumn,
      ];

  return (
    <section aria-label={title} style={{ marginBottom: 24 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text strong>
          {title} ({entries.length}/{TASK_LIMIT})
        </Text>
        <Tooltip title={isFull ? `Limited to ${TASK_LIMIT} tasks` : ""}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isFull}
            onClick={() => setIsFormOpen(true)}
          >
            Add
          </Button>
        </Tooltip>
      </Space>
      <Table
        columns={columns}
        dataSource={entries}
        rowKey="id"
        scroll={{ x: true }}
        pagination={false}
        locale={{ emptyText: "No task yet, use Add to create one" }}
        size={"small"}
      />
      {isFormOpen && (
        <TaskFormModal
          category={category}
          title={`Add ${title} Task`}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </section>
  );
};

const TaskContent = () => (
  <div>
    <div style={{ marginBottom: 16 }}>
      <ServerTime />
    </div>
    <TaskTable category="weeklyAccount" title="Weekly [Account]" />
    <WeeklyCharacterTable />
    <WeeklyRewardSummary />
  </div>
);

export default TaskContent;
