import { Collapse, CollapseProps, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  ParadoxShopCurrency,
  ParadoxShopDragonJade,
  ParadoxShopEquipment,
  ParadoxShopItem,
  ParadoxShopRune,
} from "../../../data/paradox/ParadoxShopData";

const { Text } = Typography;

const makeColumns = (withLimit: boolean): ColumnsType<ParadoxShopItem> => [
  { title: "Exchange Item", dataIndex: "item" },
  { title: "Qty.", dataIndex: "qty", width: 60 },
  { title: "Required Currency", dataIndex: "currency" },
  {
    title: "Price",
    dataIndex: "price",
    width: 80,
    render: (price: number) => price.toLocaleString(),
  },
  ...(withLimit
    ? [
        {
          title: "Limit",
          dataIndex: "limit",
          render: (limit?: string) => limit ?? "-",
        },
      ]
    : []),
];

const shopTable = (
  dataSource: ParadoxShopItem[],
  withLimit = false,
  note?: string
) => (
  <div style={{ overflowX: "auto" }}>
    {note && (
      <Text style={{ display: "block", marginBottom: 8 }}>{note}</Text>
    )}
    <Table
      size="small"
      rowKey="key"
      dataSource={dataSource}
      columns={makeColumns(withLimit)}
      pagination={false}
      bordered
    />
  </div>
);

const NOTES = [
  "Only Paradox Warrior can use the Paradox Shop (NPC Future Regenerator Shawei Sv3, Saint Haven).",
  "Paradox Fragment: exclusive equipment, Dragon Jade, Skill Dragon Jade (+1 to +10) & Rune enhancement, shop purchases.",
  "Paradox Stone: later enhancement levels, evolution (Upgrade Chips), Dragon Jade evolution, Rune add-on stat reset, shop purchases.",
  "Paradox Warrior items don't come from Sealed Skill Dragon Jades, Invader drops, Goddess Heraldry Pouches or Skill Rune Pouches.",
];

const DRAGON_JADE_NOTES = [
  "Paradox Dragon Jade fits Magic grade or higher Paradox equipment only (Normal grade comes with a Class Mastery III skill).",
  "Grades: Normal → Magic. Enhance to +10, then evolve the Normal +10 into Magic +0 (part & skill stat kept).",
  "Paradox Blue Energy rerolls its skill add-on stat (enhancement level kept).",
];

const RUNE_NOTES = [
  "Ancient grade Frozen Paradox Runes, enhanced to +10 with Paradox Fragments at 100% (Sunset Energy Rune Hammers can't be used).",
  "5 Paradox Warrior skills roll at Lv.1-10: Crescent Fall (Main), Terminus Edge (Ultimate), Unbound Cut (2nd Specialization), Reflection Slash (Secondary), Circle Break (Class Mastery III).",
  "Ark's Power resets the 1st-3rd add-on stats together for 1 Paradox Stone; locked stats are kept.",
];

const noteList = (notes: string[]) => (
  <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
    {notes.map((note) => (
      <Text key={note}>* {note}</Text>
    ))}
  </div>
);

const items: CollapseProps["items"] = [
  { key: "note", label: "Note", children: noteList(NOTES) },
  {
    key: "currency",
    label: "Currency",
    children: shopTable(
      ParadoxShopCurrency,
      true,
      "Trade stage & nest currencies for Paradox Fragments and Paradox Stones."
    ),
  },
  {
    key: "equipment",
    label: "Equipment",
    children: shopTable(
      ParadoxShopEquipment,
      false,
      "Normal grade Paradox equipment, Upgrade Chips (evolve +10 into the next grade) and Paradox Purple Energy (reroll skill add-on)."
    ),
  },
  {
    key: "heraldry",
    label: "Skill Heraldry",
    children: (
      <Text>
        Ancient's Blueprints, Ancient's Goddess Heraldry and Epic Skill Plates,
        same price & currency as for other classes.
      </Text>
    ),
  },
  {
    key: "dragonJade",
    label: "Dragon Jade",
    children: (
      <>
        {noteList(DRAGON_JADE_NOTES)}
        {shopTable(ParadoxShopDragonJade)}
      </>
    ),
  },
  {
    key: "rune",
    label: "Rune",
    children: (
      <>
        {noteList(RUNE_NOTES)}
        {shopTable(ParadoxShopRune, true)}
      </>
    ),
  },
];

const ParadoxShopContent = () => (
  <div>
    <Collapse items={items} size="small" defaultActiveKey={["note"]} />
  </div>
);

export default ParadoxShopContent;
