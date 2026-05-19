import { Select, Table } from "antd";
import {
  ArrowRight,
  Feather,
  Gem,
  Hexagon,
  Package,
  Shield,
  Sparkles,
  Swords,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ChartsCard, { ChartItem } from "../../components/ChartsCard";
import ListingCard from "../../components/ListingCard";
import { EmptyCommonnStat, TAB_KEY } from "../../constants/Common.constants";
import { EQUIPMENT } from "../../constants/InGame.constants";
import { dataConversionCalculator } from "../../data/ConversionCalculatorData";
import { CommonEquipmentCalculator } from "../../interface/Common.interface";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
} from "../../utils/common.util";
import { getResource } from "../../utils/resource.util";

// ─── Reference table helper ───────────────────────────────────────────────────

const renderRefTable = (headers: string[], rows: (string | number | undefined | null)[][]) => (
  <div className="overflow-x-auto rounded-md border">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-muted">
          {headers.map((h) => (
            <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
            {row.map((cell, j) => (
              <td key={j} className="px-3 py-1.5 tabular-nums">
                {cell === undefined || cell === null
                  ? "-"
                  : typeof cell === "number"
                  ? cell.toLocaleString()
                  : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const getLabel = (item: number) => {
  if (item === 0) return "Buy";
  if (item >= 12) return `Legend +${item - 12}`;
  return `+${item - 1}`;
};

const opt = (start: number, end: number) =>
  Array.from({ length: end + 1 - start }, (_, k) => k + start).map((item) => ({
    label: getLabel(item),
    value: item,
  }));

const CONV_FRAG = 3500;
const WEAP_FRAG = 1;
const EV_AST_STONE = 3;
const EV_AST_POW_ARMOR = 1000;
const EV_AST_POW_WEAP = 1500;
const EV_AST_POW_ACC = 1150;
const EV_AST_POW_WTD = 1300;
const WEAP_ENH_SUC_RATE = [50, 40, 35, 20, 10, 7, 5, 5, 3, 3];
const ENC_AST_POW_ARMOR = 450;
const ENC_AST_STONE_ARMOR = 1;
const ENC_AST_POW_ACC = 500;
const ENC_AST_STONE_ACC = 3;
const ENC_AST_POW_WEAP = 600;
const ENC_AST_STONE_WEAP = 3;
const ENC_AST_POW_WTD = 550;
const ENC_AST_STONE_WTD = 3;

const ARMOR_KEYS = ["1", "2", "3", "4", "5"];
const WEAPON_KEYS = ["6", "7"];
const ACC_KEYS = ["8", "9", "10", "11"];
const WTD_KEYS = ["12", "13", "14"];
const ALL_KEYS = [...ARMOR_KEYS, ...WEAPON_KEYS, ...ACC_KEYS, ...WTD_KEYS];

type MatKey = "Armor Fragment" | "Acc Fragment" | "Wtd Fragment" | "Astral Powder" | "Astral Stone";

const MATERIAL_META: {
  key: MatKey;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}[] = [
  { key: "Armor Fragment",  label: "Armor Fragment",  icon: Shield,   colorClass: "text-sky-500",    bgClass: "bg-sky-500/10" },
  { key: "Acc Fragment",    label: "Acc Fragment",    icon: Gem,      colorClass: "text-violet-500", bgClass: "bg-violet-500/10" },
  { key: "Wtd Fragment",    label: "WTD Fragment",    icon: Feather,  colorClass: "text-teal-500",   bgClass: "bg-teal-500/10" },
  { key: "Astral Powder",   label: "Astral Powder",   icon: Sparkles, colorClass: "text-purple-500", bgClass: "bg-purple-500/10" },
  { key: "Astral Stone",    label: "Astral Stone",    icon: Hexagon,  colorClass: "text-slate-500",  bgClass: "bg-slate-500/10" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const ConversionContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CommonEquipmentCalculator[]>(dataConversionCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);
  const [selectStat, setSelectStat] = useState<{ label: string; value: string }>();
  const [selectPrev, setSelectPrev] = useState<{ label: string; value: string }>();

  const handleSave = (row: CommonEquipmentCalculator) => {
    setDataSource((prev) => {
      const next = [...prev];
      const idx = next.findIndex((item) => item.key === row.key);
      if (idx !== -1) next.splice(idx, 1, { ...next[idx], ...row });
      return next;
    });
  };

  const toggleRow = (key: React.Key) => {
    setSelectedRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleGroup = (keys: string[]) => {
    const allSelected = keys.every((k) => selectedRowKeys.includes(k));
    setSelectedRowKeys((prev) =>
      allSelected
        ? prev.filter((k) => !keys.includes(k as string))
        : [...new Set([...prev, ...keys])]
    );
  };

  const invalidDtSrc = useMemo(
    () =>
      selectedRowKeys.some((key) => {
        const found = dataSource.find((dt) => dt.key === key);
        return found ? found.to <= found.from : false;
      }),
    [selectedRowKeys, dataSource]
  );

  const tableResource = useMemo(() => {
    const temp: Record<MatKey, number> & { "Weapon Fragment": number } = {
      "Armor Fragment": 0,
      "Acc Fragment": 0,
      "Wtd Fragment": 0,
      "Weapon Fragment": 0,
      "Astral Powder": 0,
      "Astral Stone": 0,
    };
    if (invalidDtSrc) return temp;

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!found) return;
      const { equipment, from, to } = found;
      const isBuy = from === 0;
      const isEnhUnique = to <= 11 && from <= 11;
      const isEvo = to >= 12 && from <= 11;
      const frag =
        (Math.min(to, 11) - Math.max(isEnhUnique ? from : 11, 1)) * CONV_FRAG +
        (isBuy ? CONV_FRAG : 0);
      let lgFrag = 0;
      let lgStone = 0;
      const enhLRange = Math.min(to, 15) - Math.max(from, 1) - (isEvo ? 1 : 0);

      switch (equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          temp["Armor Fragment"] += frag;
          if (isEvo) { lgFrag += EV_AST_POW_ARMOR; lgStone += EV_AST_STONE; }
          if (!isEnhUnique) { lgFrag += enhLRange * ENC_AST_POW_ARMOR; lgStone += enhLRange * ENC_AST_STONE_ARMOR; }
          break;
        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          if (isEvo) { lgFrag += EV_AST_POW_WEAP; lgStone += EV_AST_STONE; }
          if (!isEnhUnique) { lgFrag += enhLRange * ENC_AST_POW_WEAP; lgStone += enhLRange * ENC_AST_STONE_WEAP; }
          break;
        case EQUIPMENT.NECKLACE:
        case EQUIPMENT.EARRING:
        case EQUIPMENT.RING1:
        case EQUIPMENT.RING2:
          temp["Acc Fragment"] += frag;
          if (isEvo) { lgFrag += EV_AST_POW_ACC; lgStone += EV_AST_STONE; }
          if (!isEnhUnique) { lgFrag += enhLRange * ENC_AST_POW_ACC; lgStone += enhLRange * ENC_AST_STONE_ACC; }
          break;
        case EQUIPMENT.WING:
        case EQUIPMENT.TAIL:
        case EQUIPMENT.DECAL:
          temp["Wtd Fragment"] += frag;
          if (isEvo) { lgFrag += EV_AST_POW_WTD; lgStone += EV_AST_STONE; }
          if (!isEnhUnique) { lgFrag += enhLRange * ENC_AST_POW_WTD; lgStone += enhLRange * ENC_AST_STONE_WTD; }
          break;
        default:
          break;
      }
      temp["Astral Powder"] += lgFrag;
      temp["Astral Stone"] += lgStone;
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const statDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (invalidDtSrc) return temp;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (found) {
        const { equipment, from, to } = found;
        const tableHolder = getResource(TAB_KEY.miscConversion, equipment);
        const { dt1, dt2 } = getComparedData(tableHolder, from, to);
        if (dt2) {
          const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
          temp = combineEqStats(temp, dt, "add");
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const weaponNotes = useMemo(() => {
    if (invalidDtSrc) return;
    let main: string[] = [];
    let second: string[] = [];
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (found) {
        const { equipment, from, to } = found;
        const tempSlice = WEAP_ENH_SUC_RATE.slice(Math.max(from, 1) - 1, Math.min(to, 11) - 1);
        if (equipment === EQUIPMENT.MAIN_WEAPON && tempSlice.length) main = tempSlice.map((r) => `${r}%`);
        if (equipment === EQUIPMENT.SECOND_WEAPON && tempSlice.length) second = tempSlice.map((r) => `${r}%`);
      }
    });
    return { main, second };
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  useEffect(() => {
    setDataSource((prev) =>
      prev.map((item) => ({
        ...item,
        from: selectFrom < item.min ? item.min : selectFrom >= item.max ? item.max : selectFrom,
        to: selectTo > item.max ? item.max : selectTo,
      }))
    );
  }, [selectFrom, selectTo]);

  const chartItems = useMemo((): ChartItem[] => {
    const stat = selectStat?.value.replace("Desc", "") as keyof CommonItemStats;
    const holder: ChartItem[] = [];
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (found) {
        const { equipment, from, to } = found;
        const tableHolder = [{ ...EmptyCommonnStat, encLevel: "Buy" }].concat(
          getResource(TAB_KEY.miscConversion, equipment)
        );
        const clippedTable = tableHolder.slice(from, to + 1);
        let prevStatVal = 0;
        clippedTable.forEach((it, idx) => {
          const val = it[stat] !== undefined && typeof it[stat] === "number" ? (it[stat] as number) : 0;
          const dif = idx !== 0 ? val - prevStatVal : 0;
          prevStatVal = val;
          holder.push({ enhance: it.encLevel, total: val, step: dif, type: equipment });
        });
      }
    });
    return holder;
  }, [selectStat, selectedRowKeys, dataSource]);

  const hasMaterials = MATERIAL_META.some(({ key }) => tableResource[key] > 0);

  // ─── Sub-components ───────────────────────────────────────────────────────────

  const renderGroup = (
    label: string,
    GroupIcon: React.ElementType,
    accentClass: string,
    keys: string[]
  ) => {
    const allSelected = keys.every((k) => selectedRowKeys.includes(k));
    const rows = dataSource.filter((r) => keys.includes(r.key));

    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className={cn("w-0.5 h-3.5 rounded-full", accentClass)} />
            <GroupIcon size={11} className="text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </span>
          </div>
          <button
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => toggleGroup(keys)}
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>

        <div className="space-y-0.5">
          {rows.map((row) => {
            const isSelected = selectedRowKeys.includes(row.key);
            const hasError = row.to <= row.from;
            return (
              <div
                key={row.key}
                className={cn(
                  "flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all duration-100",
                  isSelected
                    ? "bg-primary/5 ring-1 ring-primary/15"
                    : "hover:bg-muted/50"
                )}
              >
                <Checkbox
                  id={`eq-${row.key}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleRow(row.key)}
                />
                <label
                  htmlFor={`eq-${row.key}`}
                  className={cn(
                    "flex-1 text-sm cursor-pointer select-none transition-colors",
                    isSelected ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {row.equipment}
                </label>
                <Select
                  size="small"
                  value={row.from}
                  options={opt(row.min, row.max)}
                  onChange={(val) => handleSave({ ...row, from: val })}
                  status={isSelected && hasError ? "error" : undefined}
                  style={{ width: 86 }}
                />
                <ArrowRight size={12} className="shrink-0 text-muted-foreground/60" />
                <Select
                  size="small"
                  value={row.to}
                  options={opt(row.min, row.max)}
                  onChange={(val) => handleSave({ ...row, to: val })}
                  status={isSelected && hasError ? "error" : undefined}
                  style={{ width: 86 }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <Tabs defaultValue="calculator">
      <TabsList className="mb-4">
        <TabsTrigger value="calculator">Calculator</TabsTrigger>
        <TabsTrigger value="reference">Reference</TabsTrigger>
      </TabsList>

      {/* ── CALCULATOR ── */}
      <TabsContent value="calculator" className="mt-0 space-y-4">

        {/* Settings bar */}
        <Card size="sm" className="bg-muted/30">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">Quick select</span>
                {[
                  { label: "Armor",       keys: ARMOR_KEYS },
                  { label: "Weapon",      keys: WEAPON_KEYS },
                  { label: "Accessories", keys: ACC_KEYS },
                  { label: "WTD",         keys: WTD_KEYS },
                  { label: "All",         keys: ALL_KEYS },
                ].map(({ label, keys }) => (
                  <Button key={label} size="xs" variant="outline" onClick={() => setSelectedRowKeys(keys)}>
                    {label}
                  </Button>
                ))}
                <Button size="xs" variant="ghost" onClick={() => setSelectedRowKeys([])}>
                  Clear
                </Button>
              </div>

              <Separator orientation="vertical" className="h-5 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Apply to all</span>
                <Select
                  value={selectFrom}
                  size="small"
                  style={{ width: 86 }}
                  onChange={setSelectFrom}
                  options={opt(0, 15)}
                />
                <ArrowRight size={12} className="text-muted-foreground/60" />
                <Select
                  value={selectTo}
                  size="small"
                  style={{ width: 86 }}
                  onChange={setSelectTo}
                  options={opt(0, 15)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment + Materials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Equipment selection */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield size={14} className="text-muted-foreground" />
                Equipment Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {renderGroup("Armor",       Shield,  "bg-sky-400",    ARMOR_KEYS)}
              <Separator />
              {renderGroup("Weapon",      Swords,  "bg-rose-400",   WEAPON_KEYS)}
              <Separator />
              {renderGroup("Accessories", Gem,     "bg-violet-400", ACC_KEYS)}
              <Separator />
              {renderGroup("WTD",         Feather, "bg-teal-400",   WTD_KEYS)}
            </CardContent>
          </Card>

          {/* Required materials */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Package size={14} className="text-muted-foreground" />
                Required Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {invalidDtSrc && (
                <Alert variant="destructive" className="mb-3 py-2">
                  <AlertDescription className="text-xs">
                    "From" must be less than "To" for all selected equipment.
                  </AlertDescription>
                </Alert>
              )}

              {!hasMaterials && !invalidDtSrc && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package size={36} className="mb-3 opacity-15" />
                  <p className="text-sm text-center leading-relaxed">
                    Select equipment and set an<br />enhancement range to begin.
                  </p>
                </div>
              )}

              {hasMaterials && (
                <div className="space-y-1">
                  {MATERIAL_META.filter(({ key }) => tableResource[key] > 0).map(
                    ({ key, label, icon: Icon, colorClass, bgClass }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={cn("rounded-full p-1.5", bgClass)}>
                            <Icon size={12} className={colorClass} />
                          </div>
                          <span className="text-sm">{label}</span>
                        </div>
                        <span className="text-sm font-mono font-medium tabular-nums">
                          {tableResource[key].toLocaleString()}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weapon success-rate notes */}
        {((weaponNotes?.main?.length ?? 0) > 0 || (weaponNotes?.second?.length ?? 0) > 0) && (
          <Card size="sm">
            <CardContent className="py-3 space-y-1">
              {(weaponNotes?.main?.length ?? 0) > 0 && (
                <p className="text-sm text-muted-foreground">
                  Main Weapon success rate: {weaponNotes!.main.join(", ")}
                </p>
              )}
              {(weaponNotes?.second?.length ?? 0) > 0 && (
                <p className="text-sm text-muted-foreground">
                  Second Weapon success rate: {weaponNotes!.second.join(", ")}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status + Charts */}
        <ListingCard title="Status Increase" data={getStatDif(statDif)} />

        <ChartsCard
          title="Status Charts"
          data={chartItems}
          statVal={selectStat}
          setStatVal={setSelectStat}
          statPrev={selectPrev}
          setStatPrev={setSelectPrev}
        />
      </TabsContent>

      {/* ── REFERENCE ── */}
      <TabsContent value="reference">
        <Tabs defaultValue="stats-armor" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="stats-armor">Armor Stats</TabsTrigger>
            <TabsTrigger value="stats-weapon">Weapon Stats</TabsTrigger>
            <TabsTrigger value="stats-acc">Accessories Stats</TabsTrigger>
            <TabsTrigger value="stats-wtd">WTD Stats</TabsTrigger>
            <TabsTrigger value="mats">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="stats-armor">
            <div className="space-y-4">
              {(
                [
                  { title: "Helm",  eq: EQUIPMENT.HELM,  cols: { phyMagAtkFlag: true, phyMagAtkPercentFlag: true, fdFlag: true, strFlag: true, agiFlag: true, intFlag: true, vitFlag: true, strPercentFlag: true, agiPercentFlag: true, intPercentFlag: true, vitPercentFlag: true, hpFlag: true, hpPercentFlag: true } },
                  { title: "Upper", eq: EQUIPMENT.UPPER, cols: { phyMagAtkPercentFlag: true, attAtkPercentFlag: true, crtPercentFlag: true, fdFlag: true, strFlag: true, agiFlag: true, intFlag: true, vitFlag: true, strPercentFlag: true, agiPercentFlag: true, intPercentFlag: true, vitPercentFlag: true, hpFlag: true, hpPercentFlag: true } },
                  { title: "Lower", eq: EQUIPMENT.LOWER, cols: { phyMagAtkPercentFlag: true, attAtkPercentFlag: true, crtPercentFlag: true, fdFlag: true, strFlag: true, agiFlag: true, intFlag: true, vitFlag: true, hpFlag: true, hpPercentFlag: true } },
                  { title: "Glove", eq: EQUIPMENT.GLOVE, cols: { phyMagAtkPercentFlag: true, attAtkPercentFlag: true, crtPercentFlag: true, fdFlag: true, strFlag: true, agiFlag: true, intFlag: true, vitFlag: true, hpFlag: true, hpPercentFlag: true } },
                  { title: "Shoes", eq: EQUIPMENT.SHOES, cols: { phyMagAtkPercentFlag: true, attAtkPercentFlag: true, fdFlag: true, strFlag: true, agiFlag: true, intFlag: true, vitFlag: true, strPercentFlag: true, agiPercentFlag: true, intPercentFlag: true, vitPercentFlag: true, hpFlag: true, hpPercentFlag: true, moveSpeedPercentFlag: true } },
                ] as const
              ).map(({ title, eq, cols }) => (
                <div key={title}>
                  <p className="text-sm font-semibold mb-2">{title}</p>
                  <div className="overflow-x-auto rounded-md border">
                    <Table size="small" dataSource={getResource(TAB_KEY.miscConversion, eq)} columns={getColumnsStats(cols)} pagination={false} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats-weapon">
            <div className="space-y-4">
              {(
                [
                  { title: "Main Weapon",   eq: EQUIPMENT.MAIN_WEAPON,   cols: { phyMagAtkFlag: true, phyMagAtkPercentFlag: true, attAtkPercentFlag: true, crtFlag: true, crtPercentFlag: true, fdFlag: true, strFlag: true, agiFlag: true, intFlag: true, vitFlag: true, cdmFlag: true } },
                  { title: "Second Weapon", eq: EQUIPMENT.SECOND_WEAPON, cols: { phyMagAtkFlag: true, phyMagAtkPercentFlag: true, attAtkPercentFlag: true, cdmFlag: true, fdFlag: true, crtFlag: true } },
                ] as const
              ).map(({ title, eq, cols }) => (
                <div key={title}>
                  <p className="text-sm font-semibold mb-2">{title}</p>
                  <div className="overflow-x-auto rounded-md border">
                    <Table size="small" dataSource={getResource(TAB_KEY.miscConversion, eq)} columns={getColumnsStats(cols)} pagination={false} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats-acc">
            <div className="space-y-4">
              {(
                [
                  { title: "Necklace", eq: EQUIPMENT.NECKLACE, cols: { phyMagAtkFlag: true, phyMagAtkPercentFlag: true, attAtkPercentFlag: true, cdmFlag: true, fdFlag: true, strFlag: true, agiFlag: true, intFlag: true, vitFlag: true, defFlag: true, magdefFlag: true } },
                  { title: "Earring",  eq: EQUIPMENT.EARRING,  cols: { phyMagAtkFlag: true, phyMagAtkPercentFlag: true, attAtkPercentFlag: true, crtFlag: true, crtPercentFlag: true, cdmFlag: true, fdFlag: true, hpFlag: true, hpPercentFlag: true } },
                  { title: "Ring",     eq: EQUIPMENT.RING1,    cols: { phyMagAtkFlag: true, phyMagAtkPercentFlag: true, attAtkPercentFlag: true, crtFlag: true, cdmFlag: true, fdFlag: true } },
                ] as const
              ).map(({ title, eq, cols }) => (
                <div key={title}>
                  <p className="text-sm font-semibold mb-2">{title}</p>
                  <div className="overflow-x-auto rounded-md border">
                    <Table size="small" dataSource={getResource(TAB_KEY.miscConversion, eq)} columns={getColumnsStats(cols)} pagination={false} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats-wtd">
            <div className="space-y-4">
              {(
                [
                  { title: "Wing",  eq: EQUIPMENT.WING,  note: "*Legend stats based on KDN patch note", cols: { phyMagAtkFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, cdmFlag: true, fdFlag: true, vitFlag: true, moveSpeedPercentFlag: true, moveSpeedPercentTownFlag: true } },
                  { title: "Tail",  eq: EQUIPMENT.TAIL,  note: "*Legend stats based on KDN patch note", cols: { phyMagAtkFlag: true, phyMagAtkPercentFlag: true, attAtkPercentFlag: true, fdFlag: true, strFlag: true, agiFlag: true, intFlag: true, vitFlag: true, defPercentFlag: true, magdefPercentFlag: true } },
                  { title: "Decal", eq: EQUIPMENT.DECAL, note: "*Legend stats based on KDN patch note", cols: { phyMagAtkFlag: true, attAtkPercentFlag: true, crtFlag: true, crtPercentFlag: true, cdmFlag: true, fdFlag: true, defFlag: true, magdefFlag: true, defPercentFlag: true, magdefPercentFlag: true } },
                ] as const
              ).map(({ title, eq, note, cols }) => (
                <div key={title}>
                  <p className="text-sm font-semibold mb-2">
                    {title}
                    {note && <span className="ml-2 text-xs font-normal text-muted-foreground italic">{note}</span>}
                  </p>
                  <div className="overflow-x-auto rounded-md border">
                    <Table size="small" dataSource={getResource(TAB_KEY.miscConversion, eq)} columns={getColumnsStats(cols)} pagination={false} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mats">
            <div className="space-y-6">
              {[
                {
                  label: "Armor",
                  fragLabel: "Armor Fragment",
                  buyRow: true,
                  evo: EV_AST_POW_ARMOR,
                  enc: ENC_AST_POW_ARMOR,
                  encStone: ENC_AST_STONE_ARMOR,
                  note: "* +1 to +10 have 100% success rate",
                  weaponNote: undefined as string | undefined,
                },
                {
                  label: "Weapon",
                  fragLabel: "Weapon Fragment",
                  buyRow: false,
                  evo: EV_AST_POW_WEAP,
                  enc: ENC_AST_POW_WEAP,
                  encStone: ENC_AST_STONE_WEAP,
                  note: "* Buy Conversion Weapon box via Trading House or Cherry Store",
                  weaponNote: `Success rate: ${WEAP_ENH_SUC_RATE.map((r) => `${r}%`).join(", ")}`,
                },
                {
                  label: "Accessories",
                  fragLabel: "Acc Fragment",
                  buyRow: true,
                  evo: EV_AST_POW_ACC,
                  enc: ENC_AST_POW_ACC,
                  encStone: ENC_AST_STONE_ACC,
                  note: "* +1 to +10 have 100% success rate",
                  weaponNote: undefined as string | undefined,
                },
                {
                  label: "WTD (Wing / Tail / Decal)",
                  fragLabel: "WTD Fragment",
                  buyRow: true,
                  evo: EV_AST_POW_WTD,
                  enc: ENC_AST_POW_WTD,
                  encStone: ENC_AST_STONE_WTD,
                  note: "* +1 to +10 have 100% success rate",
                  weaponNote: undefined as string | undefined,
                },
              ].map(({ label, fragLabel, buyRow, evo, enc, encStone, note, weaponNote }) => (
                <div key={label}>
                  <p className="text-sm font-semibold mb-3">{label}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Enhancement — uses {fragLabel}
                      </p>
                      {renderRefTable(["Action", "Amount"], [
                        ...(buyRow ? [["Buy from Store", CONV_FRAG] as [string, number]] : []),
                        ["Every tap +0 → +10", buyRow ? CONV_FRAG : WEAP_FRAG],
                      ])}
                      <p className="text-xs text-muted-foreground mt-1 italic">{note}</p>
                      {weaponNote && <p className="text-xs text-muted-foreground italic">{weaponNote}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Evo to Legend</p>
                      {renderRefTable(["Material", "Amount"], [
                        ["Astral Powder", evo],
                        ["Astral Stone", EV_AST_STONE],
                      ])}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Enhancement Legend (per tap)</p>
                      {renderRefTable(["Material", "Amount"], [
                        ["Astral Powder", enc],
                        ["Astral Stone", encStone],
                      ])}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
};

export default ConversionContent;
