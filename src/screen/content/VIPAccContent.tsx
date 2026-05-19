import { Alert, Collapse, CollapseProps, Select, Table } from "antd";
import { ArrowRight, Gem, Package, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { getListOpt } from "../../components/EquipmentTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import ListingCard, { ItemList } from "../../components/ListingCard";
import ChartsCard, { ChartItem } from "../../components/ChartsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { EQUIPMENT } from "../../constants/InGame.constants";
import { dataIonaCalculator, IonaEqEnhanceMaterialTable } from "../../data/VIPAccData";
import { CommonEquipmentCalculator } from "../../interface/Common.interface";
import { IonaEqEnhanceMaterial } from "../../interface/Item.interface";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
  getSuccessRateTag,
} from "../../utils/common.util";
import { EmptyCommonnStat, TAB_KEY } from "../../constants/Common.constants";
import { getResource } from "../../utils/resource.util";


type SelectedStats = Exclude<EQUIPMENT, EQUIPMENT.HELM | EQUIPMENT.UPPER | EQUIPMENT.LOWER | EQUIPMENT.GLOVE | EQUIPMENT.SHOES | EQUIPMENT.MAIN_WEAPON | EQUIPMENT.SECOND_WEAPON>;
type EquipmentExtraData = { [key in SelectedStats]?: { "Success Rate": Array<number> } };
interface TableMaterialList { "White Core": number }

const ACC_KEYS = ["1", "2", "3", "4"];

const VIPAccContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CommonEquipmentCalculator[]>(dataIonaCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);
  const [selectStat, setSelectStat] = useState<{ label: string; value: string }>();
  const [selectPrev, setSelectPrev] = useState<{ label: string; value: string }>();

  useEffect(() => {
    setDataSource((prev) => prev.map((item) => ({ ...item, from: selectFrom, to: selectTo })));
  }, [selectFrom, selectTo]);

  const invalidDtSrc = useMemo(() => selectedRowKeys.some((k) => {
    const f = dataSource.find((d) => d.key === k);
    return f ? f.to <= f.from : false;
  }), [selectedRowKeys, dataSource]);

  const tableResource: { res1: TableMaterialList; res2: EquipmentExtraData } = useMemo(() => {
    const temp: TableMaterialList = { "White Core": 0 };
    const temp2: EquipmentExtraData = {};
    if (invalidDtSrc) return { res1: temp, res2: temp2 };

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!found) return;
      const { equipment, from, to } = found;
      let tempSlice: IonaEqEnhanceMaterial[] = [];
      switch (equipment) {
        case EQUIPMENT.RING1: case EQUIPMENT.RING2: case EQUIPMENT.EARRING: case EQUIPMENT.NECKLACE:
          tempSlice = IonaEqEnhanceMaterialTable.slice(from, to); break;
        default: break;
      }
      let wc = 0;
      const srTemp: number[] = [];
      tempSlice.forEach((s) => { wc += s.whiteCore; srTemp.push(s.successRatePercent); });
      temp["White Core"] += wc;
      switch (equipment) {
        case EQUIPMENT.RING1: case EQUIPMENT.RING2: case EQUIPMENT.EARRING: case EQUIPMENT.NECKLACE:
          temp2[equipment] = { "Success Rate": srTemp }; break;
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
      const tableHolder = getResource(TAB_KEY.eqVIPAcc, equipment);
      const { dt1, dt2 } = getComparedData(tableHolder, from + 1, to + 1);
      if (dt2) { const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2; temp = combineEqStats(temp, dt, "add"); }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const extraInfo: ItemList[] = useMemo(() => {
    const list: ItemList[] = [];
    const colItems: CollapseProps["items"] = [];
    Object.entries(tableResource.res2).forEach(([key, value]) => {
      colItems.push({
        key,
        styles: { header: { padding: "4px 4px 0px 4px" }, body: { padding: "0px 4px", marginTop: 8, marginBottom: 8 } },
        label: <div>{`${key} `}{getSuccessRateTag(key, value?.["Success Rate"])}</div>,
        children: <ListingCard data={[{ title: `${key} Success Rate : `, value: value?.["Success Rate"]?.map((it: any) => `${it}%`).join(", ") }]} />,
      });
    });
    if (colItems.length > 0) list.push({ title: "Summary", isHeader: true, children: <Collapse ghost key="summary-item" items={colItems} size="small" /> });
    return list;
  }, [tableResource.res2]);

  const chartItems = useMemo((): ChartItem[] => {
    const stat = selectStat?.value.replace("Desc", "") as keyof CommonItemStats;
    const holder: ChartItem[] = [];
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!found) return;
      const { equipment, from, to } = found;
      const clippedTable = getResource(TAB_KEY.eqVIPAcc, equipment).slice(from, to + 1);
      let prevStatVal = 0;
      clippedTable.forEach((it, idx) => {
        const val = it[stat] !== undefined && typeof it?.[stat] === "number" ? (it[stat] as number) : 0;
        const dif = idx !== 0 ? val - prevStatVal : 0;
        prevStatVal = val;
        holder.push({ enhance: it.encLevel, total: val, step: dif, type: equipment });
      });
    });
    return holder;
  }, [selectStat, selectedRowKeys, dataSource]);

  const matEntries = Object.entries(tableResource.res1).filter(([, v]) => v !== 0) as [string, number][];

  const handleSave = (row: CommonEquipmentCalculator) => {
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
                <Button size="xs" variant="outline" onClick={() => setSelectedRowKeys(ACC_KEYS)}>All</Button>
                <Button size="xs" variant="ghost" onClick={() => setSelectedRowKeys([])}>Clear</Button>
              </div>
              <Separator orientation="vertical" className="h-5 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Apply to all</span>
                <Select value={selectFrom} size="small" style={{ width: 68 }} onChange={setSelectFrom} options={getListOpt(0, 15)} />
                <ArrowRight size={12} className="text-muted-foreground/60" />
                <Select value={selectTo} size="small" style={{ width: 68 }} onChange={setSelectTo} options={getListOpt(0, 15)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Gem size={14} className="text-muted-foreground" />
                Equipment Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {renderGroup("Accessories", Gem, "bg-violet-400", ACC_KEYS)}
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

            <Card size="sm">
              <CardHeader className="border-b pb-2">
                <CardTitle className="text-sm">Status Charts</CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <ChartsCard data={chartItems} statVal={selectStat} setStatVal={setSelectStat} statPrev={selectPrev} setStatPrev={setSelectPrev} />
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* ── Stats Reference ── */}
      <TabsContent value="stats">
        <Tabs defaultValue="ring">
          <TabsList className="mb-4">
            <TabsTrigger value="ring">Ring</TabsTrigger>
            <TabsTrigger value="earring">Earring</TabsTrigger>
            <TabsTrigger value="necklace">Necklace</TabsTrigger>
          </TabsList>
          <TabsContent value="ring" className="mt-0 overflow-x-auto"><Table size="small" dataSource={getResource(TAB_KEY.eqVIPAcc, EQUIPMENT.RING1)} columns={getColumnsStats({ phyMagAtkFlag: true, phyMagAtkPercentFlag: true, attAtkPercentFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="earring" className="mt-0 overflow-x-auto"><Table size="small" dataSource={getResource(TAB_KEY.eqVIPAcc, EQUIPMENT.EARRING)} columns={getColumnsStats({ phyMagAtkFlag: true, phyMagAtkPercentFlag: true, crtFlag: true, cdmFlag: true, fdFlag: true, strFlag: true, agiFlag: true, intFlag: true })} pagination={false} bordered /></TabsContent>
          <TabsContent value="necklace" className="mt-0 overflow-x-auto"><Table size="small" dataSource={getResource(TAB_KEY.eqVIPAcc, EQUIPMENT.NECKLACE)} columns={getColumnsStats({ phyMagAtkFlag: true, phyMagAtkPercentFlag: true, attAtkPercentFlag: true, fdFlag: true, strFlag: true, agiFlag: true, intFlag: true })} pagination={false} bordered /></TabsContent>
        </Tabs>
      </TabsContent>

      {/* ── Materials Reference ── */}
      <TabsContent value="mats" className="space-y-4">
        <p className="text-sm text-muted-foreground border-l-2 border-border pl-3">
          Go to Merchant Pania or Merchant Farvana (3900 Iona Core/item), or exchange Argenta / Geraint Accessories via Path of Iona (10 Iona Core).
        </p>
        <Card className="overflow-hidden">
          <CardHeader className="border-b py-3 px-4 bg-muted/30">
            <CardTitle className="text-sm">Enhancement Table</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-xs border-b border-border">
                    <th className="text-left px-4 py-2.5 font-semibold tracking-wide">Level</th>
                    <th className="text-right px-3 py-2.5 font-semibold tracking-wide">White Core</th>
                    <th className="text-right px-4 py-2.5 font-semibold tracking-wide">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {IonaEqEnhanceMaterialTable.map((row, idx) => (
                    <tr key={row.encLevel} className={cn("border-b border-border/40 transition-colors hover:bg-muted/50", idx % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                      <td className="px-4 py-1.5">
                        <span className="inline-flex h-5 min-w-[2.5rem] items-center justify-center rounded px-1.5 font-mono text-[11px] font-bold ring-1 ring-inset bg-muted text-foreground ring-border">{row.encLevel}</span>
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.whiteCore.toLocaleString()}</td>
                      <td className="px-4 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.successRatePercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-4 py-2 text-xs text-muted-foreground border-t border-border/40">* Necklace, Earring & Ring have the same enhancement requirement</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default VIPAccContent;
