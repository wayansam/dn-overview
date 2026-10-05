import { PlusOutlined } from "@ant-design/icons";
import { Button, Space, Table, Tag, Tooltip, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import ReleaseNotes from "../../../components/ReleaseNotes";
import { CHARACTER_LIMIT } from "../../../constants/Character.constants";
import { getClassById } from "../../../data/character/ClassData";
import { useAppSelector } from "../../../hooks";
import useCharacterNavigation from "../../../hooks/useCharacterNavigation";
import { Character } from "../../../interface/Account.interface";
const { Text } = Typography;

const GeneralContent = () => {
  const openCharacterScreen = useCharacterNavigation();
  const { characters, groups, mainCharacterId } = useAppSelector(
    (state) => state.Character,
  );
  const isFull = characters.length >= CHARACTER_LIMIT;

  const columns: ColumnsType<Character> = [
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
    {
      title: "Level",
      dataIndex: "level",
    },
    {
      title: "Class",
      dataIndex: "classId",
      render: (_, { classId }) => getClassById(classId)?.name ?? classId,
    },
    {
      title: "Base Class",
      key: "baseClass",
      render: (_, { classId }) => getClassById(classId)?.baseClass ?? "-",
    },
    {
      title: "ID",
      dataIndex: "groupId",
      render: (_, { groupId }) =>
        groups.find((item) => item.id === groupId)?.name ?? "-",
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
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text strong>
          Characters ({characters.length}/{CHARACTER_LIMIT})
        </Text>
        <Tooltip
          title={isFull ? `Limited to ${CHARACTER_LIMIT} characters` : ""}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={isFull}
            onClick={() => openCharacterScreen({ isNew: true })}
          >
            Add
          </Button>
        </Tooltip>
      </Space>
      <Table
        columns={columns}
        dataSource={characters}
        rowKey="id"
        pagination={{ pageSize: 5, hideOnSinglePage: false }}
      />
      <ReleaseNotes onlyNew={true} />
    </div>
  );
};

export default GeneralContent;
