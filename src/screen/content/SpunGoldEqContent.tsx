import { Alert, Select, Table } from "antd";
import { ArrowRight, Package, Shield, Swords, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { BasicOpt, getListOpt } from "../../components/EquipmentTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import ListingCard from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { EmptyCommonnStat } from "../../constants/Common.constants";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  SpunGoldEqEnhanceMaterialArmorTable,
  SpunGoldEqEnhanceMaterialWeapTable,
  SpunGoldEvolverCraftArmorT1,
  SpunGoldEvolverCraftArmorT2,
  SpunGoldEvolverCraftWeapon,
  SpunGoldStatsGlovesTable,
  SpunGoldStatsHelmTable,
  SpunGoldStatsLowerTable,
  SpunGoldStatsMainTable,
  SpunGoldStatsSecondTable,
  SpunGoldStatsShoesTable,
  SpunGoldStatsUpperTable,
  dataGoldSpunCalculator,
} from "../../data/SpunGoldEqData";
import { CommonEquipmentCalculator } from "../../interface/Common.interface";
import { SpunGoldEqEnhanceMaterial } from "../../interface/Item.interface";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
} from "../../utils/common.util";

interface TableMaterialList {
  "Shattered Armor Crystal": number;
  "Shattered Weapon Crystal": number;
  "Foundation Stone": number;
  "Dim. Vestige": number;
  Gold: number;
}

const SpunOption: BasicOpt[] = [
  { key: [EQUIPMENT.HELM, EQUIPMENT.UPPER, EQUIPMENT.LOWER, EQUIPMENT.GLOVE, EQUIPMENT.SHOES], option: [{ label: "No", value: 0 }, { label: "Tier 1", value: 1 }, { label: "Tier 2", value: 2 }] },
  { key: [EQUIPMENT.MAIN_WEAPON, EQUIPMENT.SECOND_WEAPON], option: [{ label: "No", value: 0 }, { label: "Tier 2", value: 2 }] },
];

const ARMOR_KEYS = ["1", "2", "3", "4", "5"];
const WEAPON_KEYS = ["6", "7"];

const SpunGoldEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CommonEquipmentCalculator<{ craft: number }>[]>(dataGoldSpunCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(0);
  const [selectCr, setSelectCr] = useState<number>(0);

  useEffect(() => {
    const getCraftValue = (eq: EQUIPMENT, selected: number, current: number) => {
      const craftOpt = SpunOption.find((it) => it.key.includes(eq));
      if (craftOpt) { const found = craftOpt.option.find((i) => i.value === selected); return found ? found.value : current; }
      return 0;
    };
    setDataSource((prev) => prev.map((item) => ({ ...item, from: selectFrom, to: selectTo, craft: getCraftValue(item.equipment, selectCr, item.craft) })));
  }, [selectFrom, selectTo, selectCr]);

  const invalidEnhanceSteps = useMemo(() => selectedRowKeys.some((k) => {
    const f = dataSource.find((d) => d.key === k);
    return f ? f.to <= f.from : false;
  }), [selectedRowKeys, dataSource]);

  const tableResource: { res1: TableMaterialList } = useMemo(() => {
    const temp: TableMaterialList = { "Shattered Armor Crystal": 0, "Shattered Weapon Crystal": 0, "Foundation Stone": 0, "Dim. Vestige": 0, Gold: 0 };
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!found) return;
      const { equipment, from, to, craft } = found;
      let tempSlice: SpunGoldEqEnhanceMaterial[] = [];
      let tempCraft: SpunGoldEqEnhanceMaterial | undefined;
      switch (equipment) {
        case EQUIPMENT.HELM: case EQUIPMENT.UPPER: case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE: case EQUIPMENT.SHOES:
          if (!invalidEnhanceSteps) tempSlice = SpunGoldEqEnhanceMaterialArmorTable.slice(from, to);
          if (craft === 1) tempCraft = SpunGoldEvolverCraftArmorT1;
          if (craft === 2) tempCraft = SpunGoldEvolverCraftArmorT2;
          break;
        case EQUIPMENT.MAIN_WEAPON: case EQUIPMENT.SECOND_WEAPON:
          if (!invalidEnhanceSteps) tempSlice = SpunGoldEqEnhanceMaterialWeapTable.slice(from, to);
          if (craft === 2) tempCraft = SpunGoldEvolverCraftWeapon;
          break;
        default: break;
      }
      let sc = tempCraft?.shatteredCrystal ?? 0, fs = tempCraft?.foundationStone ?? 0, dv = tempCraft?.dimVestige ?? 0, gd = tempCraft?.gold ?? 0;
      tempSlice.forEach((s) => { sc += s.shatteredCrystal; fs += s.foundationStone; dv += s.dimVestige; gd += s.gold; });
      switch (equipment) {
        case EQUIPMENT.HELM: case EQUIPMENT.UPPER: case EQUIPMENT.LOWER: case EQUIPMENT.GLOVE: case EQUIPMENT.SHOES:
          temp["Shattered Armor Crystal"] += sc; break;
        case EQUIPMENT.MAIN_WEAPON: case EQUIPMENT.SECOND_WEAPON:
          temp["Shattered Weapon Crystal"] += sc; break;
        default: break;
      }
      temp["Foundation Stone"] += fs; temp["Dim. Vestige"] += dv; temp.Gold += gd;
    });
    return { res1: temp };
  }, [selectedRowKeys, dataSource, invalidEnhanceSteps]);

  const statDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (invalidEnhanceSteps) return temp;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!found) return;
      const { equipment, from, to } = found;
      const tableHolder: CommonItemStats[] = (() => {
        switch (equipment) {
          case EQUIPMENT.HELM: return SpunGoldStatsHelmTable;
          case EQUIPMENT.UPPER: return SpunGoldStatsUpperTable;
          case EQUIPMENT.LOWER: return SpunGoldStatsLowerTable;
          case EQUIPMENT.GLOVE: return SpunGoldStatsGlovesTable;
          case EQUIPMENT.SHOES: return SpunGoldStatsShoesTable;
          case EQUIPMENT.MAIN_WEAPON: return SpunGoldStatsMainTable;
          case EQUIPMENT.SECOND_WEAPON: return SpunGoldStatsSecondTable;
          default: return [];
        }
      })();
      const { dt1, dt2 } = getComparedData(tableHolder, from + 1, to + 1);
      if (dt2) { const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2; temp = combineEqStats(temp, dt, "add"); }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidEnhanceSteps]);

  const matEntries = Object.entries(tableResource.res1).filter(([, v]) => v !== 0) as [string, number][];

  const handleSave = (row: CommonEquipmentCalculator<{ craft: number }>) => {
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
            const craftOptions = SpunOption.find((it) => it.key.includes(row.equipment))?.option ?? [];
            return (
              <div key={row.key} className={cn("flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all duration-100", isSelected ? "bg-primary/5 ring-1 ring-primary/15" : "hover:bg-muted/50")}>
                <Checkbox id={`eq-${row.key}`} checked={isSelected} onCheckedChange={() => toggleRow(row.key)} />
                <label htmlFor={`eq-${row.key}`} className={cn("flex-1 text-sm cursor-pointer select-none transition-colors", isSelected ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {row.equipment}
                </label>
                <Select size="small" value={row.from} options={getListOpt(row.min, row.max)} onChange={(val) => handleSave({ ...row, from: val })} status={isSelected && hasError ? "error" : undefined} style={{ width: 68 }} />
                <ArrowRight size={12} className="shrink-0 text-muted-foreground/60" />
                <Select size="small" value={row.to} options={getListOpt(row.min, row.max)} onChange={(val) => handleSave({ ...row, to: val })} status={isSelected && hasError ? "error" : undefined} style={{ width: 68 }} />
                <Select size="small" value={row.craft} options={craftOptions} onChange={(val) => handleSave({ ...row, craft: val })} style={{ width: 72 }} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
                <Select value={selectFrom} size="small" style={{ width: 68 }} onChange={setSelectFrom} options={getListOpt(0, 10)} />
                <ArrowRight size={12} className="text-muted-foreground/60" />
                <Select value={selectTo} size="small" style={{ width: 68 }} onChange={setSelectTo} options={getListOpt(0, 10)} />
              </div>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Craft</span>
                <Select value={selectCr} size="small" style={{ width: 88 }} onChange={setSelectCr} options={SpunOption[0].option} />
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
            {invalidEnhanceSteps && <Alert banner message="From cannot exceed the To option" type="error" />}

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Package size={14} className="text-muted-foreground" />
                  Required Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
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

            <ListingCard title="Status Increase" data={getStatDif(statDif)} />
            <TradingHouseCalc data={[{ name: "Dim. Vestige", amt: tableResource.res1["Dim. Vestige"] }]} additionalTotal={tableResource.res1.Gold} />
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
          <TabsContent value="helm" className="mt-0 overflow-x-auto"><Table size="small" dataSource={SpunGoldStatsHelmTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, attAtkPercentFlag: true, defFlag: true, magdefFlag: true, hpFlag: true, hpPercentFlag: true, phyMagAtkPercentFlag: true, crtFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="upper" className="mt-0 overflow-x-auto"><Table size="small" dataSource={SpunGoldStatsUpperTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, fdFlag: true, defFlag: true, magdefFlag: true, hpFlag: true, hpPercentFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, attAtkPercentFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="lower" className="mt-0 overflow-x-auto"><Table size="small" dataSource={SpunGoldStatsLowerTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, cdmFlag: true, defFlag: true, magdefFlag: true, hpFlag: true, hpPercentFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, attAtkPercentFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="glove" className="mt-0 overflow-x-auto"><Table size="small" dataSource={SpunGoldStatsGlovesTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, defFlag: true, magdefFlag: true, hpFlag: true, hpPercentFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, attAtkPercentFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="shoes" className="mt-0 overflow-x-auto"><Table size="small" dataSource={SpunGoldStatsShoesTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, defFlag: true, magdefFlag: true, hpFlag: true, hpPercentFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, attAtkPercentFlag: true, moveSpeedPercentFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="main" className="mt-0 overflow-x-auto"><Table size="small" dataSource={SpunGoldStatsMainTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, cdmFlag: true, fdFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="second" className="mt-0 overflow-x-auto"><Table size="small" dataSource={SpunGoldStatsSecondTable} columns={getColumnsStats({ phyMagAtkMinFlag: true, phyMagAtkMaxFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, cdmFlag: true, fdFlag: true })} pagination={false} bordered /></TabsContent>
        </Tabs>
      </TabsContent>

      {/* ── Materials Reference ── */}
      <TabsContent value="mats" className="space-y-4">
        {([
          { label: "Armor", data: SpunGoldEqEnhanceMaterialArmorTable },
          { label: "Weapon", data: SpunGoldEqEnhanceMaterialWeapTable },
        ] as { label: string; data: typeof SpunGoldEqEnhanceMaterialArmorTable }[]).map(({ label, data }) => (
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
                      <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Shattered Crystal</th>
                      <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Foundation Stone</th>
                      <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Dim. Vestige</th>
                      <th className="text-right px-4 py-2.5 font-semibold tracking-wide">Gold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={row.encLevel} className={cn("border-b border-border/40 transition-colors hover:bg-muted/50", idx % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                        <td className="px-4 py-1.5">
                          <span className="inline-flex h-5 min-w-[2.5rem] items-center justify-center rounded px-1.5 font-mono text-[11px] font-bold ring-1 ring-inset bg-muted text-foreground ring-border">{row.encLevel}</span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.shatteredCrystal.toLocaleString()}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.foundationStone.toLocaleString()}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.dimVestige.toLocaleString()}</td>
                        <td className="px-4 py-1.5 text-right font-mono text-xs tabular-nums font-semibold text-amber-600 dark:text-amber-400">{row.gold.toLocaleString()}</td>
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

export default SpunGoldEqContent;
