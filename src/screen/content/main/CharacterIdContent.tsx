import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import {
  CHARACTER_GROUP_LIMIT,
  CHARACTER_GROUP_NAME_MAX_LENGTH,
} from "../../../constants/Character.constants";
import { getClassById } from "../../../data/character/ClassData";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import useCharacterNavigation from "../../../hooks/useCharacterNavigation";
import {
  Character,
  CharacterGroup,
} from "../../../interface/Account.interface";
import {
  addCharacterGroup,
  deleteCharacterGroup,
  updateCharacterGroup,
} from "../../../slice/Character.reducer";
import { isNameTaken } from "../../../utils/characterStorage.util";
const { Text } = Typography;

interface GroupFormValues {
  name: string;
}

const CharacterIdContent = () => {
  const dispatch = useAppDispatch();
  const openCharacterScreen = useCharacterNavigation();
  const [form] = Form.useForm<GroupFormValues>();
  const [modal, modalContextHolder] = Modal.useModal();

  const { characters, groups, mainCharacterId } = useAppSelector(
    (state) => state.Character,
  );
  // undefined: closed, null: adding, otherwise: renaming that group.
  const [editingGroup, setEditingGroup] = useState<
    CharacterGroup | null | undefined
  >(undefined);

  const isFull = groups.length >= CHARACTER_GROUP_LIMIT;
  const getMembers = (groupId: string) =>
    characters.filter((item) => item.groupId === groupId);
  const unassignedCount = characters.filter((item) => !item.groupId).length;

  const openForm = (group: CharacterGroup | null) => {
    form.resetFields();
    form.setFieldsValue({ name: group?.name ?? "" });
    setEditingGroup(group);
  };

  const onSubmit = async () => {
    let values: GroupFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const name = values.name.trim();
    if (editingGroup) {
      dispatch(updateCharacterGroup({ id: editingGroup.id, name }));
    } else {
      dispatch(addCharacterGroup(name));
    }
    setEditingGroup(undefined);
  };

  const onDelete = (group: CharacterGroup) => {
    const memberCount = getMembers(group.id).length;
    modal.confirm({
      title: `Delete ${group.name}?`,
      content: memberCount
        ? `${memberCount} character(s) are attached to this ID. Proceed anyway? They will be kept, but without an ID.`
        : "This ID has no character attached.",
      okText: memberCount ? "Yes" : "Delete",
      okButtonProps: { danger: true },
      cancelText: memberCount ? "No" : "Cancel",
      onOk: () => {
        dispatch(deleteCharacterGroup(group.id));
      },
    });
  };

  const groupColumns: ColumnsType<CharacterGroup> = [
    {
      title: "ID",
      dataIndex: "name",
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "Characters",
      key: "count",
      render: (_, { id }) => getMembers(id).length,
    },
    {
      title: "Action",
      key: "action",
      render: (_, group) => (
        <Space>
          <Button size="small" onClick={() => openForm(group)}>
            Rename
          </Button>
          <Button size="small" danger onClick={() => onDelete(group)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const characterColumns: ColumnsType<Character> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_, { id, name }) => (
        <Space size={4}>
          <Text>{name}</Text>
          {id === mainCharacterId && <Tag color="gold">Main</Tag>}
        </Space>
      ),
    },
    { title: "Level", dataIndex: "level" },
    {
      title: "Class",
      dataIndex: "classId",
      render: (_, { classId }) => getClassById(classId)?.name ?? classId,
    },
    {
      title: "Action",
      key: "action",
      render: (_, { id }) => (
        <Button
          size="small"
          onClick={() => openCharacterScreen({ characterId: id })}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      {modalContextHolder}
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text strong>
          IDs ({groups.length}/{CHARACTER_GROUP_LIMIT})
        </Text>
        <Tooltip
          title={isFull ? `Limited to ${CHARACTER_GROUP_LIMIT} IDs` : ""}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isFull}
            onClick={() => openForm(null)}
          >
            Add
          </Button>
        </Tooltip>
      </Space>
      <Table
        columns={groupColumns}
        dataSource={groups}
        rowKey="id"
        pagination={false}
        expandable={{
          defaultExpandAllRows: true,
          expandedRowRender: (group) => {
            const members = getMembers(group.id);
            return members.length ? (
              <Table
                columns={characterColumns}
                dataSource={members}
                rowKey="id"
                size="small"
                pagination={false}
              />
            ) : (
              <Text type="secondary">No character attached</Text>
            );
          },
        }}
      />
      {unassignedCount > 0 && (
        <Text type="secondary" style={{ display: "block", marginTop: 12 }}>
          {unassignedCount} character(s) have no ID. Attach one from the
          Character screen.
        </Text>
      )}

      <Modal
        title={editingGroup ? "Rename ID" : "Add ID"}
        open={editingGroup !== undefined}
        okText="Save"
        onOk={onSubmit}
        onCancel={() => setEditingGroup(undefined)}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, whitespace: true, message: "Name is required" },
              {
                validator: (_, value?: string) =>
                  value && isNameTaken(groups, value, editingGroup?.id)
                    ? Promise.reject(new Error("Name is already used"))
                    : Promise.resolve(),
              },
            ]}
          >
            <Input maxLength={CHARACTER_GROUP_NAME_MAX_LENGTH} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CharacterIdContent;
