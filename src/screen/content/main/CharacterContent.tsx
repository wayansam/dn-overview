import {
  OrderedListOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Grid,
  Input,
  Popover,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { ColumnType } from "antd/es/table";
import { Fragment, ReactNode, useMemo, useState } from "react";
import CharacterDetailModal from "../../../components/CharacterDetailModal";
import OrderSettingList from "../../../components/OrderSettingList";
import ReorderListModal from "../../../components/ReorderListModal";
import { CHARACTER_LIMIT } from "../../../constants/Character.constants";
import { LS_KEYS } from "../../../constants/localStorage.constants";
import { getClassById } from "../../../data/character/ClassData";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { Character } from "../../../interface/Account.interface";
import { reorderCharacters } from "../../../slice/Character.reducer";
import {
  OrderSetting,
  loadOrderSetting,
  saveOrderSetting,
} from "../../../utils/orderSetting.util";
const { Text } = Typography;
const { useBreakpoint } = Grid;

// Filter value for characters without an ID (real ids are UUIDs).
const NO_ID_FILTER = "__no_id__";

// Columns the user can show / hide. Name and Action are always shown.
const OPTIONAL_COLUMNS = [
  { label: "Level", value: "level" },
  { label: "Class", value: "classId" },
  { label: "Base Class", value: "baseClass" },
  { label: "ID", value: "groupId" },
];
const OPTIONAL_COLUMN_KEYS = OPTIONAL_COLUMNS.map((item) => item.value);

// Filter options only list values that exist in the current data.
const toFilters = (values: { label: string; value: string }[]) =>
  Array.from(new Map(values.map((item) => [item.value, item])).values()).sort(
    (a, b) => a.label.localeCompare(b.label),
  );

const CharacterContent = () => {
  const dispatch = useAppDispatch();
  // Small screens show only Name and Action, the other columns are listed
  // under the name instead.
  const isCompact = !useBreakpoint().md;
  const { characters, groups, mainCharacterId } = useAppSelector(
    (state) => state.Character,
  );
  const [search, setSearch] = useState("");
  const [classIds, setClassIds] = useState<string[]>([]);
  const [baseClasses, setBaseClasses] = useState<string[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [columnSetting, setColumnSetting] = useState<OrderSetting>(() =>
    loadOrderSetting(LS_KEYS.character_columns, OPTIONAL_COLUMN_KEYS),
  );
  const isFull = characters.length >= CHARACTER_LIMIT;
  const payload = useAppSelector(
    (state) => state.UIState.selectedSideBar.payload?.characterScreen,
  );
  // Character shown in the detail modal, `{}` for a new one. The payload
  // (Details / Add from other screens) is only read on mount.
  const [detail, setDetail] = useState<{ characterId?: string } | undefined>(
    () => {
      const id = payload?.characterId;
      if (id && characters.some((item) => item.id === id)) {
        return { characterId: id };
      }
      return payload?.isNew && !isFull ? {} : undefined;
    },
  );
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const hasFilter =
    !!search || !!classIds.length || !!baseClasses.length || !!groupIds.length;

  const changeColumnSetting = (setting: OrderSetting) => {
    setColumnSetting(setting);
    saveOrderSetting(LS_KEYS.character_columns, setting);
  };

  const clearFilters = () => {
    setSearch("");
    setClassIds([]);
    setBaseClasses([]);
    setGroupIds([]);
  };

  const filteredCharacters = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return characters.filter(({ name, classId, groupId }) => {
      if (keyword && !name.toLowerCase().includes(keyword)) return false;
      if (classIds.length && !classIds.includes(classId)) return false;
      if (baseClasses.length) {
        const baseClass = getClassById(classId)?.baseClass;
        if (!baseClass || !baseClasses.includes(baseClass)) return false;
      }
      if (groupIds.length && !groupIds.includes(groupId ?? NO_ID_FILTER)) {
        return false;
      }
      return true;
    });
  }, [characters, search, classIds, baseClasses, groupIds]);

  const classOptions = toFilters(
    characters.map(({ classId }) => ({
      label: getClassById(classId)?.name ?? classId,
      value: classId,
    })),
  );
  const baseClassOptions = toFilters(
    characters.flatMap(({ classId }) => {
      const baseClass = getClassById(classId)?.baseClass;
      return baseClass ? [{ label: baseClass, value: baseClass }] : [];
    }),
  );
  const idOptions = [
    ...groups.map((item) => ({ label: item.name, value: item.id })),
    { label: "No ID", value: NO_ID_FILTER },
  ];

  const shownColumnKeys = columnSetting.order.filter((key) =>
    columnSetting.visible.includes(key),
  );
  const renderValue: Record<string, (character: Character) => ReactNode> = {
    level: ({ level }) => level,
    classId: ({ classId }) => getClassById(classId)?.name ?? classId,
    baseClass: ({ classId }) => getClassById(classId)?.baseClass ?? "-",
    groupId: ({ groupId }) =>
      groups.find((item) => item.id === groupId)?.name ?? "-",
  };

  const nameColumn: ColumnType<Character> = {
    title: "Name",
    key: "name",
    dataIndex: "name",
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (_, character) => (
      <Space direction="vertical" size={0}>
        <Space size={4}>
          <Text>{character.name}</Text>
          {character.id === mainCharacterId && <Tag color="gold">Main</Tag>}
        </Space>
        {isCompact && !!shownColumnKeys.length && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {shownColumnKeys.map((key, index) => (
              <Fragment key={key}>
                {index > 0 && " · "}
                {
                  OPTIONAL_COLUMNS.find((item) => item.value === key)?.label
                }: {renderValue[key](character)}
              </Fragment>
            ))}
          </Text>
        )}
      </Space>
    ),
  };
  const optionalColumns: ColumnType<Character>[] = shownColumnKeys.map(
    (key) => ({
      title: OPTIONAL_COLUMNS.find((item) => item.value === key)?.label,
      key,
      sorter:
        key === "level"
          ? (a: Character, b: Character) => a.level - b.level
          : undefined,
      render: (_: unknown, character: Character) => renderValue[key](character),
    }),
  );
  const actionColumn: ColumnType<Character> = {
    title: "Action",
    key: "action",
    render: (_, { id }) => (
      <Button
        size="small"
        onClick={() => setDetail({ characterId: id })}
      >
        Details
      </Button>
    ),
  };
  // Name stays first and Action stays last, only the columns between them
  // follow the user's order.
  const columns = isCompact
    ? [nameColumn, actionColumn]
    : [nameColumn, ...optionalColumns, actionColumn];

  const filterStyle = { width: isCompact ? "100%" : 200 };

  const columnSettingContent = (
    <OrderSettingList
      items={OPTIONAL_COLUMNS}
      setting={columnSetting}
      onChange={changeColumnSetting}
      fixedTop={["Name"]}
      fixedBottom={["Action"]}
    />
  );

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
          <Tooltip title="Arrange character order">
            <Button
              icon={<OrderedListOutlined />}
              disabled={characters.length < 2}
              onClick={() => setIsReorderOpen(true)}
            />
          </Tooltip>
          <Popover
            title="Columns"
            trigger="click"
            placement="bottomRight"
            content={columnSettingContent}
          >
            <Button icon={<SettingOutlined />}>Columns</Button>
          </Popover>
          <Tooltip
            title={isFull ? `Limited to ${CHARACTER_LIMIT} characters` : ""}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={isFull}
              onClick={() => setDetail({})}
            >
              Add
            </Button>
          </Tooltip>
        </Space>
      </Space>
      <Space
        wrap={!isCompact}
        direction={isCompact ? "vertical" : "horizontal"}
        style={{ width: isCompact ? "100%" : undefined, marginBottom: 12 }}
      >
        <Input
          allowClear
          placeholder="Find by name"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={filterStyle}
        />
        <Select
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          placeholder="Class"
          options={classOptions}
          value={classIds}
          onChange={setClassIds}
          optionFilterProp="label"
          style={filterStyle}
        />
        <Select
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          placeholder="Base Class"
          options={baseClassOptions}
          value={baseClasses}
          onChange={setBaseClasses}
          optionFilterProp="label"
          style={filterStyle}
        />
        <Select
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          placeholder="ID"
          options={idOptions}
          value={groupIds}
          onChange={setGroupIds}
          optionFilterProp="label"
          style={filterStyle}
        />
        <Button type="link" disabled={!hasFilter} onClick={clearFilters}>
          Clear filters
        </Button>
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
      {detail && (
        <CharacterDetailModal
          characterId={detail.characterId}
          onClose={() => setDetail(undefined)}
        />
      )}
      <ReorderListModal
        title="Arrange Characters"
        open={isReorderOpen}
        items={characters.map((item) => ({
          id: item.id,
          content: (
            <>
              <Text>{item.name}</Text>
              <Text type="secondary">
                Lv.{item.level} {getClassById(item.classId)?.name}
              </Text>
              {item.id === mainCharacterId && <Tag color="gold">Main</Tag>}
            </>
          ),
        }))}
        onSave={(ids) => dispatch(reorderCharacters(ids))}
        onClose={() => setIsReorderOpen(false)}
      />
    </div>
  );
};

export default CharacterContent;
