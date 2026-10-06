import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
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
import ReleaseNotes from "../../../components/ReleaseNotes";
import { CHARACTER_LIMIT } from "../../../constants/Character.constants";
import { LS_KEYS } from "../../../constants/localStorage.constants";
import { getClassById } from "../../../data/character/ClassData";
import { useAppSelector } from "../../../hooks";
import useCharacterNavigation from "../../../hooks/useCharacterNavigation";
import { Character } from "../../../interface/Account.interface";
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

interface ColumnSetting {
  order: string[];
  visible: string[];
}
const DEFAULT_COLUMN_SETTING: ColumnSetting = {
  order: OPTIONAL_COLUMN_KEYS,
  visible: OPTIONAL_COLUMN_KEYS,
};

const toKnownKeys = (value: unknown) =>
  Array.isArray(value)
    ? OPTIONAL_COLUMN_KEYS.filter((key) => value.includes(key))
    : OPTIONAL_COLUMN_KEYS;

// Never throws: unknown keys from old / hand-edited storage are dropped and
// columns missing from the saved order are appended at the end. A plain array
// is the older format that only stored the visible columns.
const loadColumnSetting = (): ColumnSetting => {
  try {
    const raw = localStorage.getItem(LS_KEYS.character_columns);
    if (!raw) return DEFAULT_COLUMN_SETTING;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { order: OPTIONAL_COLUMN_KEYS, visible: toKnownKeys(parsed) };
    }
    if (typeof parsed !== "object" || parsed === null) {
      return DEFAULT_COLUMN_SETTING;
    }
    const { order, visible } = parsed as Record<string, unknown>;
    const savedOrder = Array.isArray(order)
      ? order.filter(
          (key, index): key is string =>
            OPTIONAL_COLUMN_KEYS.includes(key) && order.indexOf(key) === index,
        )
      : [];
    return {
      order: [
        ...savedOrder,
        ...OPTIONAL_COLUMN_KEYS.filter((key) => !savedOrder.includes(key)),
      ],
      visible: toKnownKeys(visible),
    };
  } catch {
    return DEFAULT_COLUMN_SETTING;
  }
};

// Filter options only list values that exist in the current data.
const toFilters = (values: { label: string; value: string }[]) =>
  Array.from(new Map(values.map((item) => [item.value, item])).values()).sort(
    (a, b) => a.label.localeCompare(b.label),
  );

const GeneralContent = () => {
  const openCharacterScreen = useCharacterNavigation();
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
  const [columnSetting, setColumnSetting] =
    useState<ColumnSetting>(loadColumnSetting);
  const isFull = characters.length >= CHARACTER_LIMIT;
  const hasFilter =
    !!search || !!classIds.length || !!baseClasses.length || !!groupIds.length;

  const saveColumnSetting = (setting: ColumnSetting) => {
    setColumnSetting(setting);
    localStorage.setItem(LS_KEYS.character_columns, JSON.stringify(setting));
  };

  const toggleColumn = (key: string, checked: boolean) =>
    saveColumnSetting({
      ...columnSetting,
      visible: checked
        ? [...columnSetting.visible, key]
        : columnSetting.visible.filter((item) => item !== key),
    });

  const moveColumn = (index: number, offset: -1 | 1) => {
    const order = [...columnSetting.order];
    [order[index], order[index + offset]] = [
      order[index + offset],
      order[index],
    ];
    saveColumnSetting({ ...columnSetting, order });
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
        onClick={() => openCharacterScreen({ characterId: id })}
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
    <Space direction="vertical" size={4}>
      <Checkbox checked disabled>
        Name
      </Checkbox>
      {columnSetting.order.map((key, index) => (
        <Space
          key={key}
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <Checkbox
            checked={columnSetting.visible.includes(key)}
            onChange={(e) => toggleColumn(key, e.target.checked)}
          >
            {OPTIONAL_COLUMNS.find((item) => item.value === key)?.label}
          </Checkbox>
          <Space size={0}>
            <Button
              size="small"
              type="text"
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              onClick={() => moveColumn(index, -1)}
            />
            <Button
              size="small"
              type="text"
              icon={<ArrowDownOutlined />}
              disabled={index === columnSetting.order.length - 1}
              onClick={() => moveColumn(index, 1)}
            />
          </Space>
        </Space>
      ))}
      <Checkbox checked disabled>
        Action
      </Checkbox>
    </Space>
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
              onClick={() => openCharacterScreen({ isNew: true })}
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
      <ReleaseNotes onlyNew={true} />
    </div>
  );
};

export default GeneralContent;
