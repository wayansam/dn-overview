import { PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import TaskFormModal from "../../../components/TaskFormModal";
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

interface TaskTableProps {
  category: TaskCategory;
  title: string;
}

const TaskTable = ({ category, title }: TaskTableProps) => {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.Task.entries).filter(
    (item) => item.category === category,
  );
  const { characters, groups } = useAppSelector((state) => state.Character);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // A deleted ID / character shows as "-".
  const columns: ColumnsType<TaskEntry> = [
    {
      title: "Name",
      key: "name",
      render: (_, { taskId }) => getTaskById(taskId)?.name ?? taskId,
    },
    {
      title: "ID",
      key: "groupId",
      render: (_, { groupId }) =>
        groups.find((item) => item.id === groupId)?.name ?? "-",
    },
    {
      title: "Character",
      key: "characterId",
      render: (_, { characterId }) =>
        characters.find((item) => item.id === characterId)?.name ?? "-",
    },
    {
      title: "Last Cleared",
      key: "lastCleared",
      render: (_, { lastCleared }) => formatDate(lastCleared),
    },
    {
      title: "Action",
      key: "action",
      render: (_, { id, lastCleared }) => (
        <Space wrap>
          <Button
            size="small"
            type="primary"
            onClick={() => dispatch(markTaskDone(id))}
          >
            Done
          </Button>
          <Button
            size="small"
            disabled={!lastCleared}
            onClick={() => dispatch(resetTask(id))}
          >
            Reset
          </Button>
          <Popconfirm
            title="Delete this task?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => dispatch(deleteTask(id))}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text strong>{title}</Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsFormOpen(true)}
        >
          Add
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={entries}
        rowKey="id"
        scroll={{ x: true }}
        pagination={false}
        locale={{ emptyText: "No task yet, use Add to create one" }}
      />
      {isFormOpen && (
        <TaskFormModal
          category={category}
          title={`Add ${title} Task`}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

const TaskContent = () => (
  <div>
    <TaskTable category="weeklyAccount" title="Weekly Account" />
  </div>
);

export default TaskContent;
