import { Button, Card, Space, Table, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { CHARACTER_GROUP_LIMIT } from "../../constants/Character.constants";
import { TAB_KEY } from "../../constants/Common.constants";
import { getClassById } from "../../data/character/ClassData";
import { useAppSelector } from "../../hooks";
import useTabNavigation from "../../hooks/useTabNavigation";
import { Character, CharacterGroup } from "../../interface/Account.interface";
import CharacterDetailModal from "../CharacterDetailModal";
const { Text } = Typography;

// Read-only ID overview for the General dashboard. Adding, renaming and
// deleting IDs stays in the ID tab.
const CharacterIdWidget = () => {
  const openTab = useTabNavigation();
  const { characters, groups, mainCharacterId } = useAppSelector(
    (state) => state.Character,
  );
  const [detailId, setDetailId] = useState<string>();

  const getMembers = (groupId: string) =>
    characters.filter((item) => item.groupId === groupId);
  const unassignedCount = characters.filter((item) => !item.groupId).length;

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
        <Button size="small" onClick={() => setDetailId(id)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title={`IDs (${groups.length}/${CHARACTER_GROUP_LIMIT})`}
      extra={
        <Button
          size="small"
          type="link"
          onClick={() => openTab(TAB_KEY.mainId)}
        >
          View all
        </Button>
      }
    >
      <Table
        size="small"
        columns={groupColumns}
        dataSource={groups}
        rowKey="id"
        scroll={{ x: true }}
        pagination={false}
        locale={{ emptyText: "No ID yet, add one in the ID screen" }}
        expandable={{
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
        <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
          {unassignedCount} character(s) have no ID.
        </Text>
      )}
      {detailId && (
        <CharacterDetailModal
          characterId={detailId}
          onClose={() => setDetailId(undefined)}
        />
      )}
    </Card>
  );
};

export default CharacterIdWidget;
