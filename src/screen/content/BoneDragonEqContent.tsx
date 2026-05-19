import { Alert, Collapse, CollapseProps, Select, Table } from "antd";
import { ArrowRight, Package, Shield, Swords, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { getListOpt } from "../../components/EquipmentTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import ListingCard, { ItemList } from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  BoneDragonEqEnhanceMaterialArmorTable,
  BoneDragonEqEnhanceMaterialWeapTable,
  BoneDragonStatsGlovesTable,
  BoneDragonStatsHelmTable,
  BoneDragonStatsLowerTable,
  BoneDragonStatsMainTable,
  BoneDragonStatsSecondTable,
  BoneDragonStatsShoesTable,
  BoneDragonStatsUpperTable,
  dataBoneCalculator,
} from "../../data/BoneDragonEqData";
import { BoneCalculator } from "../../interface/Common.interface";
import { BoneDragonEqEnhanceMaterial } from "../../interface/Item.interface";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  combineEqStats,
  getBreakTag,
  getColumnsStats,
  getComparedData,
  getDeductTag,
  getStatDif,
  getSuccessRateTag,
} from "../../utils/common.util";
import { EmptyCommonnStat } from "../../constants/Common.constants";

type SelectedStats = Exclude<EQUIPMENT, EQUIPMENT.NECKLACE | EQUIPMENT.EARRING | EQUIPMENT.RING1 | EQUIPMENT.RING2>;
type EquipmentExtraData = {
  [key in SelectedStats]?: { "Success Rate": Array<number | undefined>; "Break Rate": Array<number | undefined>; "Fail Deduction": Array<number | undefined>; };
};
interface ExtraData extends EquipmentExtraData { Jelly: number; }
interface TableMaterialList { "Bone Fragment": number; Garnet: number; Essence: number; Gold: number; }

const ARMOR_KEYS = ["1", "2", "3", "4", "5"];
const WEAPON_KEYS = ["6", "7"];

const BoneDragonEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<BoneCalculator[]>(dataBoneCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);

  useEffect(() => {
    setDataSource((prev) => prev.map((item) => ({ ...item, from: selectFrom, to: selectTo })));
  }, [selectFrom, selectTo]);

  const invalidDtSrc = useMemo(() => selectedRowKeys.some((k) => {
    const f = dataSource.find((d) => d.key === k);
    return f ? f.to <= f.from : false;
  }), [selectedRowKeys, dataSource]);

  const warnDtSrc = useMemo(() => selectedRowKeys.some((k) => {
    const f = dataSource.find((d) => d.key === k);
    return f ? f.to > 3 : false;
  }), [selectedRowKeys, dataSource]);

  const dangerDtSrc = useMemo(() => selectedRowKeys.some((k) => {
    const f = dataSource.find((d) => d.key === k);
    return f ? f.to > 5 : false;
  }), [selectedRowKeys, dataSource]);

  const tableResource: { res1: TableMaterialList; res2: ExtraData } = useMemo(() => {
    const temp: TableMaterialList = { "Bone Fragment": 0, Garnet: 0, Essence: 0, Gold: 0 };
    const temp2: ExtraData = { Jelly: 0 };
    if (invalidDtSrc) return { res1: temp, res2: temp2 };

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!found) return;
      const { equipment, from, to } = found;
      let tempSlice: BoneDragonEqEnhanceMaterial[] = [];
      switch (equipment) {
        case EQUIPMENT.HELM: case EQUIPMENT.UPPER: case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE: case EQUIPMENT.SHOES:
          tempSlice = BoneDragonEqEnhanceMaterialArmorTable.slice(from, to); break;
        case EQUIPMENT.MAIN_WEAPON: case EQUIPMENT.SECOND_WEAPON:
          tempSlice = BoneDragonEqEnhanceMaterialWeapTable.slice(from, to); break;
        default: break;
      }
      let bf = 0, gn = 0, es = 0, gd = 0, jl = 0;
      const srTemp: number[] = [], brTemp: number[] = [], deTemp: (number | undefined)[] = [];
      tempSlice.forEach((s) => { bf += s.boneFragment; gn += s.garnet; es += s.essence; gd += s.gold; jl += s.jelly ?? 0; srTemp.push(s.successRatePercent); brTemp.push(s.breakNoJellyPercent); deTemp.push(s.enhanceFailDeduction); });
      temp["Bone Fragment"] += bf; temp.Garnet += gn; temp.Essence += es; temp.Gold += gd; temp2.Jelly += jl;
      const exData = { "Success Rate": srTemp, "Break Rate": brTemp, "Fail Deduction": deTemp };
      switch (equipment) {
        case EQUIPMENT.HELM: case EQUIPMENT.UPPER: case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE: case EQUIPMENT.SHOES:
        case EQUIPMENT.MAIN_WEAPON: case EQUIPMENT.SECOND_WEAPON:
          temp2[equipment] = exData; break;
        default: break;
      }
    });
    return { res1: temp, res2: temp2 };
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const statDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (invalidDtSrc) return temp;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!found) return;
      const { equipment, from, to } = found;
      const tableHolder: CommonItemStats[] = (() => {
        switch (equipment) {
          case EQUIPMENT.HELM: return BoneDragonStatsHelmTable;
          case EQUIPMENT.UPPER: return BoneDragonStatsUpperTable;
          case EQUIPMENT.LOWER: return BoneDragonStatsLowerTable;
          case EQUIPMENT.GLOVE: return BoneDragonStatsGlovesTable;
          case EQUIPMENT.SHOES: return BoneDragonStatsShoesTable;
          case EQUIPMENT.MAIN_WEAPON: return BoneDragonStatsMainTable;
          case EQUIPMENT.SECOND_WEAPON: return BoneDragonStatsSecondTable;
          default: return [];
        }
      })();
      const { dt1, dt2 } = getComparedData(tableHolder, from + 1, to + 1);
      if (dt2) { const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2; temp = combineEqStats(temp, dt, "add"); }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const extraInfo: ItemList[] = useMemo(() => {
    const list: ItemList[] = [];
    const colItems: CollapseProps["items"] = [];
    Object.entries(tableResource.res2).forEach(([key, value]) => {
      if (key === "Jelly") {
        list.push({ title: "Min. Jelly used", value: tableResource.res2.Jelly, format: true });
      } else {
        colItems.push({
          key, styles: { header: { padding: "4px 4px 0px 4px" }, body: { padding: "0px 4px", marginTop: 8, marginBottom: 8 } },
          label: <div>{`${key} `}{getSuccessRateTag(key, value?.["Success Rate"])}{getBreakTag(key, value?.["Break Rate"])}{getDeductTag(key, value?.["Fail Deduction"])}</div>,
          children: <ListingCard data={[
            { title: `${key} Success Rate : `, value: value?.["Success Rate"]?.map((it: any) => `${it}%`).join(", ") },
            { title: `${key} Break Rate : `, value: value?.["Break Rate"]?.map((it: any) => `${it}%`).join(", ") },
            { title: `${key} Fail Deduction : `, value: value?.["Fail Deduction"]?.map((it: any) => `${it}`).join(", ") },
          ]} />,
        });
      }
    });
    if (colItems.length > 0) list.push({ title: "Summary", isHeader: true, children: <Collapse ghost key="summary-item" items={colItems} size="small" /> });
    return list;
  }, [tableResource.res2]);

  const matEntries = Object.entries(tableResource.res1).filter(([, v]) => v !== 0) as [string, number][];

  const handleSave = (row: BoneCalculator) => {
    setDataSource((prev) => {
      const next = [...prev];
      const idx = next.findIndex((item) => item.key === row.key);
      if (idx !== -1) next.splice(idx, 1, { ...next[idx], ...row });
      return next;
    });
  };

  const toggleRow = (key: React.Key) =>
    setSelectedRowKeys((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);

  const toggleGroup = (keys: string[]) => {
    const allSelected = keys.every((k) => selectedRowKeys.includes(k));
    setSelectedRowKeys((prev) => allSelected ? prev.filter((k) => !keys.includes(k as string)) : [...new Set([...prev, ...keys])]);
  };

  const renderGroup = (label: string, GroupIcon: LucideIcon, accentClass: string, keys: string[]) => {
    const allSelected = keys.every((k) => selectedRowKeys.includes(k));
    const rows = dataSource.filter((r) => keys.includes(r.key));
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className={cn("w-0.5 h-3.5 rounded-full", accentClass)} />
            <GroupIcon size={11} className="text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
          </div>
          <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors" onClick={() => toggleGroup(keys)}>
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className="space-y-0.5">
          {rows.map((row) => {
            const isSelected = selectedRowKeys.includes(row.key);
            const hasError = row.to <= row.from;
            return (
              <div key={row.key} className={cn("flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all duration-100", isSelected ? "bg-primary/5 ring-1 ring-primary/15" : "hover:bg-muted/50")}>
                <Checkbox id={`eq-${row.key}`} checked={isSelected} onCheckedChange={() => toggleRow(row.key)} />
                <label htmlFor={`eq-${row.key}`} className={cn("flex-1 text-sm cursor-pointer select-none transition-colors", isSelected ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {row.equipment}
                </label>
                <Select size="small" value={row.from} options={getListOpt(row.min, row.max)} onChange={(val) => handleSave({ ...row, from: val })} status={isSelected && hasError ? "error" : undefined} style={{ width: 68 }} />
                <ArrowRight size={12} className="shrink-0 text-muted-foreground/60" />
                <Select size="small" value={row.to} options={getListOpt(row.min, row.max)} onChange={(val) => handleSave({ ...row, to: val })} status={isSelected && hasError ? "error" : undefined} style={{ width: 68 }} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const fmt = (v: number | undefined) => (v == null || v === 0) ? "—" : v.toLocaleString();
  const fmtPct = (v: number | undefined) => (v == null || v === 0) ? "—" : `${v}%`;

  return (
    <Tabs defaultValue="calc" className="space-y-4 pb-8">
      <TabsList>
        <TabsTrigger value="calc">Calculator</TabsTrigger>
        <TabsTrigger value="stats">Stats Reference</TabsTrigger>
        <TabsTrigger value="mats">Materials Reference</TabsTrigger>
      </TabsList>

      {/* ── Calculator ── */}
      <TabsContent value="calc" className="mt-0">

        {/* Settings bar */}
        <Card size="sm" className="mb-4 bg-muted/30">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">Quick select</span>
                {[
                  { label: "Armor", keys: ARMOR_KEYS },
                  { label: "Weapon", keys: WEAPON_KEYS },
                  { label: "All", keys: [...ARMOR_KEYS, ...WEAPON_KEYS] },
                ].map(({ label, keys }) => (
                  <Button key={label} size="xs" variant="outline" onClick={() => setSelectedRowKeys(keys)}>{label}</Button>
                ))}
                <Button size="xs" variant="ghost" onClick={() => setSelectedRowKeys([])}>Clear</Button>
              </div>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Apply to all</span>
                <Select value={selectFrom} size="small" style={{ width: 68 }} onChange={setSelectFrom} options={getListOpt(0, 20)} />
                <ArrowRight size={12} className="text-muted-foreground/60" />
                <Select value={selectTo} size="small" style={{ width: 68 }} onChange={setSelectTo} options={getListOpt(0, 20)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield size={14} className="text-muted-foreground" />
                Equipment Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {renderGroup("Armor", Shield, "bg-sky-400", ARMOR_KEYS)}
              <Separator />
              {renderGroup("Weapon", Swords, "bg-rose-400", WEAPON_KEYS)}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {invalidDtSrc && <Alert banner message="From cannot exceed the To option" type="error" />}

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Package size={14} className="text-muted-foreground" />
                  Required Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {warnDtSrc && <Alert banner message="Above +3, enhancement might fail." type="info" className="mb-3" />}
                {dangerDtSrc && <Alert banner message="Above +5, item can break." type="warning" className="mb-3" />}
                {matEntries.length === 0
                  ? <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Package size={36} className="mb-3 opacity-15" />
                      <p className="text-sm text-center leading-relaxed">Select equipment and set an<br />enhancement range to begin.</p>
                    </div>
                  : <div className="space-y-1">
                    {matEntries.map(([name, amount]) => (
                      <div key={name} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/40 transition-colors">
                        <span className="text-sm text-foreground/80">{name}</span>
                        <span className="text-sm font-mono font-medium tabular-nums">{amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                }
              </CardContent>
            </Card>

            <ListingCard keyId="extra-info" title="Extra Info" data={extraInfo} />
            <ListingCard title="Status Increase" data={getStatDif(statDif)} />
            <TradingHouseCalc
              data={[{ name: "Bone Fragment", amt: tableResource.res1["Bone Fragment"] }, { name: "Garnet", amt: tableResource.res1.Garnet }, { name: "Essence", amt: tableResource.res1.Essence }]}
              additionalTotal={tableResource.res1.Gold}
            />
          </div>
        </div>
      </TabsContent>

      {/* ── Stats Reference ── */}
      <TabsContent value="stats">
        <Tabs defaultValue="helm">
          <TabsList className="mb-4">
            <TabsTrigger value="helm">Helm</TabsTrigger>
            <TabsTrigger value="upper">Upper</TabsTrigger>
            <TabsTrigger value="lower">Lower</TabsTrigger>
            <TabsTrigger value="glove">Glove</TabsTrigger>
            <TabsTrigger value="shoes">Shoes</TabsTrigger>
            <TabsTrigger value="main">Main</TabsTrigger>
            <TabsTrigger value="second">Second</TabsTrigger>
          </TabsList>
          <TabsContent value="helm" className="mt-0 overflow-x-auto"><Table size="small" dataSource={BoneDragonStatsHelmTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, attAtkPercentFlag: true, defFlag: true, magdefFlag: true, hpFlag: true, hpPercentFlag: true, phyMagAtkPercentFlag: true, crtFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="upper" className="mt-0 overflow-x-auto"><Table size="small" dataSource={BoneDragonStatsUpperTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, fdFlag: true, defFlag: true, magdefFlag: true, hpFlag: true, hpPercentFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, attAtkPercentFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="lower" className="mt-0 overflow-x-auto"><Table size="small" dataSource={BoneDragonStatsLowerTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, cdmFlag: true, defFlag: true, magdefFlag: true, hpFlag: true, hpPercentFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, attAtkPercentFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="glove" className="mt-0 overflow-x-auto"><Table size="small" dataSource={BoneDragonStatsGlovesTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, defFlag: true, magdefFlag: true, hpFlag: true, hpPercentFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, attAtkPercentFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="shoes" className="mt-0 overflow-x-auto"><Table size="small" dataSource={BoneDragonStatsShoesTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, defFlag: true, magdefFlag: true, hpFlag: true, hpPercentFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, attAtkPercentFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="main" className="mt-0 overflow-x-auto"><Table size="small" dataSource={BoneDragonStatsMainTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, cdmFlag: true, fdFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="second" className="mt-0 overflow-x-auto"><Table size="small" dataSource={BoneDragonStatsSecondTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, cdmFlag: true, fdFlag: true })} pagination={false} bordered /></TabsContent>
        </Tabs>
      </TabsContent>

      {/* ── Materials Reference ── */}
      <TabsContent value="mats" className="space-y-4">
        <p className="text-sm text-muted-foreground border-l-2 border-amber-400 pl-3">
          Beyond +10, downgrade intervals occur every 2 levels. +10→+11 failure has no downgrade; +11→+12 failure may downgrade to +10.
        </p>
        {([
          { label: "Armor", data: BoneDragonEqEnhanceMaterialArmorTable },
          { label: "Weapon", data: BoneDragonEqEnhanceMaterialWeapTable },
        ] as { label: string; data: typeof BoneDragonEqEnhanceMaterialArmorTable }[]).map(({ label, data }) => (
          <Card key={label} className="overflow-hidden">
            <CardHeader className="border-b py-3 px-4 bg-muted/30">
              <CardTitle className="text-sm">{label}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted text-muted-foreground text-xs border-b border-border">
                      <th className="text-left px-4 py-2.5 font-semibold tracking-wide">Level</th>
                      <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Fragment</th>
                      <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Garnet</th>
                      <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Essence</th>
                      <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Gold</th>
                      <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Jelly</th>
                      <th className="text-right px-3 py-2.5 font-semibold tracking-wide">SR%</th>
                      <th className="text-right px-3 py-2.5 font-semibold tracking-wide">BR%</th>
                      <th className="text-right px-4 py-2.5 font-semibold tracking-wide">Fail -</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={row.encLevel} className={cn("border-b border-border/40 transition-colors hover:bg-muted/50", idx % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                        <td className="px-4 py-1.5">
                          <span className="inline-flex h-5 min-w-[2.5rem] items-center justify-center rounded px-1.5 font-mono text-[11px] font-bold ring-1 ring-inset bg-muted text-foreground ring-border">{row.encLevel}</span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{fmt(row.boneFragment)}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{fmt(row.garnet)}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{fmt(row.essence)}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums font-semibold text-amber-600 dark:text-amber-400">{fmt(row.gold)}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{fmt(row.jelly)}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{fmtPct(row.successRatePercent)}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{fmtPct(row.breakNoJellyPercent)}</td>
                        <td className="px-4 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{fmt(row.enhanceFailDeduction)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default BoneDragonEqContent;
