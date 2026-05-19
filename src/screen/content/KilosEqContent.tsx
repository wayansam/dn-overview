import { Alert, Select, Switch, Tooltip } from "antd";
import { ArrowRight, Package, Shield } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { EQUIPMENT } from "../../constants/InGame.constants";
import { dataKilosCalculator } from "../../data/KilosCalculatorData";
import {
  KilosT1ArmorCraftMaterial,
  KilosT1ArmorEnhanceMaterialTable,
  KilosT2ArmorEnhanceMaterialTable,
  NeedleOfIntelectCraftMaterial,
} from "../../data/KilosData";
import { KilosCalculator } from "../../interface/Common.interface";
import { KilosArmorCraftMaterial } from "../../interface/Item.interface";

interface TableMaterialList {
  "Helm Fragment": number;
  "Upper Fragment": number;
  "Lower Fragment": number;
  "Gloves Fragment": number;
  "Shoes Fragment": number;
  "Joys & Sorrow of Kilos": number;
  "High Grade Joys & Sorrow of Kilos": number;
  "Thread of Intellect": number;
  Gold: number;
  "Needle of Intellect": number;
}

const getLabel = (item: number) =>
  item <= 20 ? `T1 +${item}` : `T2 +${item - 20}`;

const opt = (start: number, end: number) =>
  Array.from({ length: end + 1 - start }, (_, k) => k + start).map((item) => ({
    label: getLabel(item),
    value: item,
  }));

const KilosEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<KilosCalculator[]>(dataKilosCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(20);
  const [checkedChange, setCheckedChange] = useState(false);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [checkedEvo, setCheckedEvo] = useState(false);

  const encTable = [...KilosT1ArmorEnhanceMaterialTable, ...KilosT2ArmorEnhanceMaterialTable];

  const handleSave = (row: KilosCalculator) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    newData.splice(index, 1, { ...newData[index], ...row });
    setDataSource(newData);
  };

  const toggleRow = (key: React.Key) => {
    setSelectedRowKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const allSelected = selectedRowKeys.length === dataSource.length;

  const invalidDtSrc = useMemo(
    () => selectedRowKeys.some((k) => {
      const f = dataSource.find((d) => d.key === k);
      return f ? f.to <= f.from : false;
    }),
    [selectedRowKeys, dataSource]
  );

  const tableResource: TableMaterialList = useMemo(() => {
    const temp: TableMaterialList = {
      "Helm Fragment": 0, "Upper Fragment": 0, "Lower Fragment": 0,
      "Gloves Fragment": 0, "Shoes Fragment": 0, "Joys & Sorrow of Kilos": 0,
      "High Grade Joys & Sorrow of Kilos": 0, "Thread of Intellect": 0,
      Gold: 0, "Needle of Intellect": 0,
    };
    if (invalidDtSrc) return temp;

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!found) return;
      const { equipment, from, to, evoTier2, craft } = found;
      let tempSlice: KilosArmorCraftMaterial[] = [];
      switch (equipment) {
        case EQUIPMENT.HELM: case EQUIPMENT.UPPER: case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE: case EQUIPMENT.SHOES:
          tempSlice = encTable.slice(from, to);
          break;
        default: break;
      }
      let frag = 0, joy = 0, hgjoy = 0, thread = 0, gold = 0;
      tempSlice.forEach((s) => { frag += s.eqTypeFragment; joy += s.joySorrow; hgjoy += s.joySorrowHG; thread += s.threadIntelect; gold += s.gold; });
      if (craft) { frag += KilosT1ArmorCraftMaterial.eqTypeFragment; thread += KilosT1ArmorCraftMaterial.threadIntelect; gold += KilosT1ArmorCraftMaterial.gold; }
      temp["Joys & Sorrow of Kilos"] += joy;
      temp["High Grade Joys & Sorrow of Kilos"] += hgjoy;
      temp["Thread of Intellect"] += thread;
      temp.Gold += gold;
      temp["Needle of Intellect"] += evoTier2 ? 1 : 0;
      switch (equipment) {
        case EQUIPMENT.HELM: temp["Helm Fragment"] += frag; break;
        case EQUIPMENT.UPPER: temp["Upper Fragment"] += frag; break;
        case EQUIPMENT.LOWER: temp["Lower Fragment"] += frag; break;
        case EQUIPMENT.GLOVE: temp["Gloves Fragment"] += frag; break;
        case EQUIPMENT.SHOES: temp["Shoes Fragment"] += frag; break;
        default: break;
      }
    });

    if (checkedChange) {
      temp["Joys & Sorrow of Kilos"] += temp["Needle of Intellect"] * NeedleOfIntelectCraftMaterial.joySorrow;
      temp["Thread of Intellect"] += temp["Needle of Intellect"] * NeedleOfIntelectCraftMaterial.threadIntelect;
      temp.Gold += temp["Needle of Intellect"] * NeedleOfIntelectCraftMaterial.gold;
      temp["Needle of Intellect"] = 0;
    }
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc, checkedChange]);

  useEffect(() => {
    setDataSource((prev) => prev.map((item) => ({
      ...item, from: selectFrom, to: selectTo, craft: checkedCraft, evoTier2: checkedEvo,
    })));
  }, [selectFrom, selectTo, checkedCraft, checkedEvo]);

  const matEntries = Object.entries(tableResource).filter(([, v]) => v !== 0) as [string, number][];

  // ── Reference table renderer ─────────────────────────────────────────────────

  const renderRefTable = (data: KilosArmorCraftMaterial[], tier: 1 | 2) => {
    const isT1 = tier === 1;
    const headerBg = "bg-sky-600 dark:bg-sky-700";
    const badgeCls = "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/25";
    const cardAccent = "bg-sky-500/5";

    return (
      <Card className="overflow-hidden">
        <CardHeader className={cn("border-b py-3 px-4", cardAccent)}>
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset", badgeCls)}>
              Tier {tier}
            </span>
            Enhancement Materials
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={cn("text-white text-xs", headerBg)}>
                  <th className="text-left px-4 py-2.5 font-semibold tracking-wide">Level</th>
                  <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Fragment</th>
                  <th className="text-right px-3 py-2.5 font-semibold tracking-wide">
                    {isT1 ? "Joys & Sorrow" : "HG Joys & Sorrow"}
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Thread of Intellect</th>
                  <th className="text-right px-4 py-2.5 font-semibold tracking-wide">Gold</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr
                    key={row.encLevel}
                    className={cn(
                      "border-b border-border/40 transition-colors hover:bg-muted/50",
                      idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                    )}
                  >
                    <td className="px-4 py-1.5">
                      <span className={cn("inline-flex h-5 min-w-[3rem] items-center justify-center rounded px-1.5 font-mono text-[11px] font-bold ring-1 ring-inset", badgeCls)}>
                        {getLabel(row.encLevel)}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.eqTypeFragment.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">
                      {isT1 ? row.joySorrow.toLocaleString() : row.joySorrowHG.toLocaleString()}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.threadIntelect.toLocaleString()}</td>
                    <td className="px-4 py-1.5 text-right font-mono text-xs tabular-nums font-semibold text-amber-600 dark:text-amber-400">{row.gold.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Tabs defaultValue="calc" className="space-y-4 pb-8">
      <TabsList>
        <TabsTrigger value="calc">Calculator</TabsTrigger>
        <TabsTrigger value="t1">Tier 1 Reference</TabsTrigger>
        <TabsTrigger value="t2">Tier 2 Reference</TabsTrigger>
      </TabsList>

      {/* ── Calculator ── */}
      <TabsContent value="calc" className="mt-0">

        {/* Settings bar */}
        <Card size="sm" className="mb-4 bg-muted/30">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">Quick select</span>
                <Button size="xs" variant="outline" onClick={() => setSelectedRowKeys(dataSource.map((r) => r.key))}>All</Button>
                <Button size="xs" variant="ghost" onClick={() => setSelectedRowKeys([])}>Clear</Button>
              </div>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Apply to all</span>
                <Select value={selectFrom} size="small" style={{ width: 110 }} onChange={setSelectFrom} options={opt(0, encTable.length)} />
                <ArrowRight size={12} className="text-muted-foreground/60" />
                <Select value={selectTo} size="small" style={{ width: 110 }} onChange={setSelectTo} options={opt(0, encTable.length)} />
              </div>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Checkbox id="craft-all" checked={checkedCraft} onCheckedChange={(v) => setCheckedCraft(Boolean(v))} />
                  <label htmlFor="craft-all" className="text-xs cursor-pointer select-none">Craft all</label>
                </div>
                <div className="flex items-center gap-1.5">
                  <Checkbox id="evo-all" checked={checkedEvo} onCheckedChange={(v) => setCheckedEvo(Boolean(v))} />
                  <label htmlFor="evo-all" className="text-xs cursor-pointer select-none">Evo T2 all</label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Equipment Selection */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-muted-foreground" />
                  Equipment Selection
                </div>
                <button
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSelectedRowKeys(allSelected ? [] : dataSource.map((r) => r.key))}
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Column headers */}
              <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/20 border-b">
                <span className="w-4 shrink-0" />
                <span className="flex-1">Equipment</span>
                <span className="w-9 text-center shrink-0">Craft</span>
                <span className="w-[214px] text-center shrink-0">Range</span>
                <span className="w-10 text-center shrink-0">Evo T2</span>
              </div>
              <div className="space-y-0.5 p-2">
                {dataSource.map((row) => {
                  const isSelected = selectedRowKeys.includes(row.key);
                  const hasError = row.to <= row.from;
                  return (
                    <div
                      key={row.key}
                      className={cn(
                        "flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all duration-100",
                        isSelected ? "bg-primary/5 ring-1 ring-primary/15" : "hover:bg-muted/50"
                      )}
                    >
                      <Checkbox
                        id={`eq-${row.key}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(row.key)}
                      />
                      <label
                        htmlFor={`eq-${row.key}`}
                        className={cn("flex-1 text-sm cursor-pointer select-none transition-colors", isSelected ? "font-medium text-foreground" : "text-muted-foreground")}
                      >
                        {row.equipment}
                      </label>
                      <Switch size="small" checked={row.craft} onChange={(e) => handleSave({ ...row, craft: e })} />
                      <Select
                        size="small"
                        value={row.from}
                        options={opt(row.min, row.max)}
                        onChange={(val) => handleSave({ ...row, from: val })}
                        status={isSelected && hasError ? "error" : undefined}
                        style={{ width: 100 }}
                      />
                      <ArrowRight size={12} className="shrink-0 text-muted-foreground/60" />
                      <Select
                        size="small"
                        value={row.to}
                        options={opt(row.min, row.max)}
                        onChange={(val) => handleSave({ ...row, to: val })}
                        status={isSelected && hasError ? "error" : undefined}
                        style={{ width: 100 }}
                      />
                      <Switch size="small" checked={row.evoTier2} onChange={(e) => handleSave({ ...row, evoTier2: e })} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Required Materials */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Package size={14} className="text-muted-foreground" />
                Required Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Checkbox
                  id="change-needle"
                  checked={checkedChange}
                  onCheckedChange={(v) => setCheckedChange(Boolean(v))}
                />
                <label htmlFor="change-needle" className="text-sm cursor-pointer select-none">
                  <Tooltip title="300 Joy & Sorrow, 2600 Thread, 5k Gold" trigger="hover" color="blue" placement="right">
                    Change Needle to Craft mats
                  </Tooltip>
                </label>
              </div>

              {invalidDtSrc && <Alert banner message="From cannot exceed the To option" type="error" className="mb-3" />}

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
        </div>
      </TabsContent>

      {/* ── Tier 1 Reference ── */}
      <TabsContent value="t1">
        {renderRefTable(KilosT1ArmorEnhanceMaterialTable, 1)}
      </TabsContent>

      {/* ── Tier 2 Reference ── */}
      <TabsContent value="t2">
        {renderRefTable(KilosT2ArmorEnhanceMaterialTable, 2)}
      </TabsContent>
    </Tabs>
  );
};

export default KilosEqContent;
