import { Form, Modal, Select } from "antd";
import { useState } from "react";
import { getClassById } from "../data/character/ClassData";
import { getTasksByCategory } from "../data/task/TaskData";
import { useAppDispatch, useAppSelector } from "../hooks";
import { TaskCategory } from "../interface/Task.interface";
import { addTask } from "../slice/Task.reducer";

interface TaskFormValues {
  taskId: string;
}

interface TaskFormModalProps {
  category: TaskCategory;
  title: string;
  onClose: () => void;
}

// Mounted only while open, so every open starts with a blank form.
const TaskFormModal = ({ category, title, onClose }: TaskFormModalProps) => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<TaskFormValues>();
  const { characters, groups } = useAppSelector((state) => state.Character);
  // ID and Character have no validation, so they live outside the form:
  // setting form fields from code trips a false "circular references"
  // warning in antd's form library.
  const [groupId, setGroupId] = useState<string>();
  const [characterId, setCharacterId] = useState<string>();

  // With an ID picked, only that ID's characters are offered.
  const characterOptions = characters
    .filter((item) => !groupId || item.groupId === groupId)
    .map((item) => ({
      value: item.id,
      label: `${item.name} - Lv.${item.level} ${
        getClassById(item.classId)?.name ?? ""
      }`,
    }));

  const changeGroup = (value?: string) => {
    setGroupId(value);
    // Clear a character that is not on the newly picked ID.
    const character = characters.find((item) => item.id === characterId);
    if (character && value && character.groupId !== value) {
      setCharacterId(undefined);
    }
  };

  const changeCharacter = (value?: string) => {
    setCharacterId(value);
    // Picking a character first fills in its ID.
    const character = characters.find((item) => item.id === value);
    if (!groupId && character?.groupId) setGroupId(character.groupId);
  };

  const onSubmit = async () => {
    let values: TaskFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    dispatch(
      addTask({
        category,
        taskId: values.taskId,
        groupId,
        characterId,
      }),
    );
    onClose();
  };

  return (
    <Modal open title={title} okText="Save" onOk={onSubmit} onCancel={onClose}>
      <Form<TaskFormValues> form={form} layout="vertical">
        <Form.Item
          label="Task"
          name="taskId"
          rules={[{ required: true, message: "Task is required" }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Select task"
            options={getTasksByCategory(category).map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />
        </Form.Item>
        <Form.Item label="ID" htmlFor="groupId">
          <Select
            id="groupId"
            allowClear
            value={groupId}
            onChange={changeGroup}
            placeholder="Select ID"
            options={groups.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            notFoundContent="No ID yet, add one in the ID screen"
          />
        </Form.Item>
        <Form.Item label="Character" htmlFor="characterId">
          <Select
            id="characterId"
            allowClear
            value={characterId}
            onChange={changeCharacter}
            showSearch
            optionFilterProp="label"
            placeholder="Select character"
            options={characterOptions}
            notFoundContent={
              groupId ? "No character on this ID" : "No character yet"
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
