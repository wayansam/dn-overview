import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Tag, Tooltip, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import ReleaseNotes from "../../../components/ReleaseNotes";
import { CHARACTER_LIMIT } from "../../../constants/Character.constants";
import { getClassById } from "../../../data/character/ClassData";
import { useAppSelector } from "../../../hooks";
import useCharacterNavigation from "../../../hooks/useCharacterNavigation";
import { Character } from "../../../interface/Account.interface";
const { Text } = Typography;

// Filter value for characters without an ID (real ids are UUIDs).
const NO_ID_FILTER = "__no_id__";

// Filter options only list values that exist in the current data.
const toFilters = (values: { text: string; value: string }[]) =>
  Array.from(new Map(values.map((item) => [item.value, item])).values()).sort(
    (a, b) => a.text.localeCompare(b.text),
  );

const GeneralContent = () => {
  const openCharacterScreen = useCharacterNavigation();
  const { characters, groups, mainCharacterId } = useAppSelector(
    (state) => state.Character,
  );
  const [search, setSearch] = useState("");
  const isFull = characters.length >= CHARACTER_LIMIT;

  const filteredCharacters = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return keyword
      ? characters.filter((item) => item.name.toLowerCase().includes(keyword))
      : characters;
  }, [characters, search]);

  const classFilters = toFilters(
    characters.map(({ classId }) => ({
      text: getClassById(classId)?.name ?? classId,
      value: classId,
    })),
  );
  const baseClassFilters = toFilters(
    characters.flatMap(({ classId }) => {
      const baseClass = getClassById(classId)?.baseClass;
      return baseClass ? [{ text: baseClass, value: baseClass }] : [];
    }),
  );
  const idFilters = [
    ...groups.map((item) => ({ text: item.name, value: item.id })),
    { text: "No ID", value: NO_ID_FILTER },
  ];

  const columns: ColumnsType<Character> = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
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
      sorter: (a, b) => a.level - b.level,
    },
    {
      title: "Class",
      dataIndex: "classId",
      filters: classFilters,
      filterSearch: true,
      onFilter: (value, { classId }) => classId === value,
      render: (_, { classId }) => getClassById(classId)?.name ?? classId,
    },
    {
      title: "Base Class",
      key: "baseClass",
      filters: baseClassFilters,
      onFilter: (value, { classId }) =>
        getClassById(classId)?.baseClass === value,
      render: (_, { classId }) => getClassById(classId)?.baseClass ?? "-",
    },
    {
      title: "ID",
      dataIndex: "groupId",
      filters: idFilters,
      onFilter: (value, { groupId }) =>
        value === NO_ID_FILTER ? !groupId : groupId === value,
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
        wrap
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text strong>
          Characters ({characters.length}/{CHARACTER_LIMIT})
        </Text>
        <Space wrap>
          <Input
            allowClear
            placeholder="Find by name"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
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
      </Space>
      <Table
        columns={columns}
        dataSource={filteredCharacters}
        rowKey="id"
        pagination={{ pageSize: 5, hideOnSinglePage: false }}
        locale={{
          emptyText: characters.length
            ? "No character matches"
            : "No character yet, use Add to create one",
        }}
      />
      <ReleaseNotes onlyNew={true} />
    </div>
  );
};

export default GeneralContent;
