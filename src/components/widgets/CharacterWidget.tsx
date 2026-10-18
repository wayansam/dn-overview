import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Space, Table, Tag, Tooltip, Typography } from "antd";
import { ColumnType } from "antd/es/table";
import { useState } from "react";
import { CHARACTER_LIMIT } from "../../constants/Character.constants";
import { getClassById } from "../../data/character/ClassData";
import { useAppSelector } from "../../hooks";
import useCharacterNavigation from "../../hooks/useCharacterNavigation";
import { Character } from "../../interface/Account.interface";
import CharacterDetailModal from "../CharacterDetailModal";
const { Text } = Typography;

// Compact character list for the General dashboard. The full table with
// filters lives in the Character tab.
const CharacterWidget = () => {
  const openCharacterScreen = useCharacterNavigation();
  const { characters, mainCharacterId } = useAppSelector(
    (state) => state.Character,
  );
  // Character shown in the detail modal, `{}` for a new one.
  const [detail, setDetail] = useState<{ characterId?: string }>();
  const isFull = characters.length >= CHARACTER_LIMIT;

  const columns: ColumnType<Character>[] = [
    {
      title: "Name",
      key: "name",
      render: (_, { id, name }) => (
        <Space size={4}>
          <Text>{name}</Text>
          {id === mainCharacterId && <Tag color="gold">Main</Tag>}
        </Space>
      ),
    },
    { title: "Level", key: "level", dataIndex: "level" },
    {
      title: "Class",
      key: "classId",
      render: (_, { classId }) => getClassById(classId)?.name ?? classId,
    },
    {
      title: "Action",
      key: "action",
      render: (_, { id }) => (
        <Button size="small" onClick={() => setDetail({ characterId: id })}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title={`Characters (${characters.length}/${CHARACTER_LIMIT})`}
      extra={
        <Space size={4}>
          <Tooltip
            title={isFull ? `Limited to ${CHARACTER_LIMIT} characters` : ""}
          >
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined />}
              aria-label="Add character"
              disabled={isFull}
              onClick={() => setDetail({})}
            />
          </Tooltip>
          <Button size="small" type="link" onClick={() => openCharacterScreen()}>
            View all
          </Button>
        </Space>
      }
    >
      <Table
        size="small"
        columns={columns}
        dataSource={characters}
        rowKey="id"
        scroll={{ x: true }}
        pagination={{ pageSize: 5, hideOnSinglePage: true, size: "small" }}
        locale={{ emptyText: "No character yet, use + to create one" }}
      />
      {detail && (
        <CharacterDetailModal
          characterId={detail.characterId}
          onClose={() => setDetail(undefined)}
        />
      )}
    </Card>
  );
};

export default CharacterWidget;
