import {
  Divider,
  Input,
  List,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import {
  PLANNED_NOTES,
  RELEASE_NOTES,
  ReleaseNote,
  ReleaseType,
} from "../constants/ReleaseNotes.constants";
import { useAppDispatch } from "../hooks";
import { setSelectedSideBar } from "../slice/UIState.reducer";

interface ReleaseNotesProps {
  onlyNew?: boolean;
}

const TYPE_COLOR: Record<ReleaseType, string> = {
  [ReleaseType.N]: "green",
  [ReleaseType.U]: "gold",
  [ReleaseType.D]: "blue",
  [ReleaseType.M]: "purple",
  [ReleaseType.P]: "default",
  [ReleaseType.I]: "red",
};

// "DD-MM-YYYY" -> YYYYMMDD as a number, 0 when missing or unparsable.
export const dateValue = (date?: string): number => {
  const match = date?.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (!match) return 0;
  const [, d, m, y] = match;
  return Number(y) * 10000 + Number(m) * 100 + Number(d);
};

export const matchesSearch = (note: ReleaseNote, search: string) => {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return [note.label, note.type, note.date ?? ""].some((text) =>
    text.toLowerCase().includes(term),
  );
};

const byDateDesc = (a: ReleaseNote, b: ReleaseNote) =>
  dateValue(b.date) - dateValue(a.date);

export const WHATS_NEW_MIN = 5;

export const WHATS_NEW_DAYS = 14;

// Entries released in the last WHATS_NEW_DAYS days; when that's fewer than
// WHATS_NEW_MIN, the WHATS_NEW_MIN latest entries instead.
export const getWhatsNew = (notes: ReleaseNote[], now = new Date()) => {
  const sorted = [...notes].sort(byDateDesc);
  const since = new Date(now);
  since.setDate(since.getDate() - WHATS_NEW_DAYS);
  const cutoff =
    since.getFullYear() * 10000 +
    (since.getMonth() + 1) * 100 +
    since.getDate();
  const recent = sorted.filter((note) => dateValue(note.date) >= cutoff);
  return recent.length >= WHATS_NEW_MIN
    ? recent
    : sorted.slice(0, WHATS_NEW_MIN);
};

const sortedNotes = [...RELEASE_NOTES].sort(byDateDesc);
const featureNotes = sortedNotes.filter((note) => note.category === "feature");
const appNotes = sortedNotes.filter((note) => note.category === "app");

const noteKey = (note: ReleaseNote) =>
  `${note.type}-${note.label}-${note.date ?? ""}`;

const TypeTag = ({ type }: { type: ReleaseType }) => (
  <Tag
    color={TYPE_COLOR[type]}
    style={{ marginInlineEnd: 0, minWidth: 64, textAlign: "center" }}
  >
    {type}
  </Tag>
);

const NoteLabel = ({ note }: { note: ReleaseNote }) => {
  const dispatch = useAppDispatch();
  if (!note.link) return <>{note.label}</>;
  return (
    <Typography.Link
      onClick={() => note.link && dispatch(setSelectedSideBar(note.link))}
    >
      {note.label}
    </Typography.Link>
  );
};

// Tag on the left, description with the date under it. Same layout at any
// width, so it reads well on phones and in the narrow dashboard widget.
const NoteRow = ({ note }: { note: ReleaseNote }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
    <div style={{ flex: "none" }}>
      <TypeTag type={note.type} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div>
        <NoteLabel note={note} />
      </div>
      {note.date && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {note.date}
        </Typography.Text>
      )}
    </div>
  </div>
);

interface ReleaseTableProps {
  data: ReleaseNote[];
}

const ReleaseTable = ({ data }: ReleaseTableProps) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(
    () => data.filter((note) => matchesSearch(note, search)),
    [data, search],
  );

  const typeFilters = useMemo(
    () =>
      Array.from(new Set(data.map((note) => note.type))).map((type) => ({
        text: type,
        value: type,
      })),
    [data],
  );

  const columns: ColumnsType<ReleaseNote> = [
    // Phones: one stacked column instead of a sideways-scrolling table.
    {
      title: "Release",
      key: "compact",
      responsive: ["xs"],
      render: (_, note) => <NoteRow note={note} />,
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 110,
      responsive: ["sm"],
      filters: typeFilters,
      onFilter: (value, note) => note.type === value,
      render: (type: ReleaseType) => <TypeTag type={type} />,
    },
    {
      title: "Description",
      dataIndex: "label",
      responsive: ["sm"],
      render: (_, note) => <NoteLabel note={note} />,
    },
    {
      title: "Date",
      dataIndex: "date",
      width: 120,
      responsive: ["sm"],
      sorter: byDateDesc,
      sortDirections: ["descend", "ascend"],
      render: (date?: string) =>
        date ?? <Typography.Text type="secondary">-</Typography.Text>,
    },
  ];

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Input.Search
        allowClear
        placeholder="Search by description, type or date"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        style={{ maxWidth: 360 }}
      />
      <Table<ReleaseNote>
        size="small"
        bordered
        columns={columns}
        dataSource={filtered}
        rowKey={noteKey}
        pagination={{
          current: page,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
          showTotal: (total) => `${total} entries`,
          onChange: (nextPage, nextSize) => {
            setPage(nextSize !== pageSize ? 1 : nextPage);
            setPageSize(nextSize);
          },
        }}
        onChange={(_pagination, _filters, _sorter, extra) => {
          if (extra.action !== "paginate") setPage(1);
        }}
      />
    </Space>
  );
};

const WhatsNewList = ({ data }: { data: ReleaseNote[] }) => (
  <List
    bordered
    size="small"
    dataSource={data}
    rowKey={noteKey}
    renderItem={(note) => (
      <List.Item>
        <NoteRow note={note} />
      </List.Item>
    )}
  />
);

const ReleaseNotes = ({ onlyNew }: ReleaseNotesProps) => {
  const newNotes = useMemo(() => getWhatsNew(RELEASE_NOTES), []);

  if (onlyNew) {
    return <WhatsNewList data={newNotes} />;
  }

  return (
    <div>
      <Divider orientation="left">What's New</Divider>
      <WhatsNewList data={newNotes} />

      <Divider orientation="left">What's Next?</Divider>
      <Space wrap>
        {PLANNED_NOTES.map((note) => (
          <Tag key={note.label} color={TYPE_COLOR[note.type]}>
            [{note.type}] {note.label}
          </Tag>
        ))}
      </Space>

      <Divider orientation="left">Release History</Divider>
      <Tabs
        items={[
          {
            key: "feature",
            label: `Functionality (${featureNotes.length})`,
            children: <ReleaseTable data={featureNotes} />,
          },
          {
            key: "app",
            label: `Update (${appNotes.length})`,
            children: <ReleaseTable data={appNotes} />,
          },
        ]}
      />
    </div>
  );
};

export default ReleaseNotes;
