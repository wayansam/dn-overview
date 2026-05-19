import { InputNumber, Select, Tooltip } from "antd";
import { ArrowRight, Package, Gem, Shield, Sword, X } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import ListingCard from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EQUIPMENT,
  ITEM_RARITY,
  LUNAR_JADE_TYPE,
} from "../../constants/InGame.constants";
import { dataCalculator } from "../../data/lunarCalculatorData";
import {
  LunarFragmentList,
  LunarJadeAttEnhancementMatsTable,
  LunarJadeAttEnhancementStatsTable,
  LunarJadeCraftAmountTable,
  LunarJadeCraftMaterialList,
  LunarJadeDefEnhancementMatsTable,
  LunarJadeDefEnhancementStatsTable,
  LunarJadeEnhanceMaterialList,
  concentratedDimensionalEnergyCraftMats,
  tigerIntactOrbCraftMats,
} from "../../data/lunarData";
import { LunarJadeCalculator } from "../../interface/Common.interface";
import { LunarFragmentData } from "../../interface/Item.interface";
import { getColor, getTextEmpty } from "../../utils/common.util";

// ─── Constants ──────────────────────────────────────────────────────────────

export const equipmentCraftOpt = [
  { value: ITEM_RARITY.CRAFT, label: ITEM_RARITY.CRAFT, rateValue: 1 },
  { value: ITEM_RARITY.NORMAL, label: ITEM_RARITY.NORMAL, rateValue: 2 },
  { value: ITEM_RARITY.MAGIC, label: ITEM_RARITY.MAGIC, rateValue: 3 },
  { value: ITEM_RARITY.RARE, label: ITEM_RARITY.RARE, rateValue: 4 },
  { value: ITEM_RARITY.EPIC, label: ITEM_RARITY.EPIC, rateValue: 5 },
  { value: ITEM_RARITY.UNIQUE, label: ITEM_RARITY.UNIQUE, rateValue: 6 },
  { value: ITEM_RARITY.LEGEND, label: ITEM_RARITY.LEGEND, rateValue: 7 },
  { value: ITEM_RARITY.ANCIENT, label: ITEM_RARITY.ANCIENT, rateValue: 8 },
];

const enhOpts = Array.from({ length: 21 }, (_, i) => ({
  label: `+${i}`,
  value: i,
}));

const ARMOR_KEYS = ["1", "2", "3", "4", "5"];
const WEAPON_KEYS = ["6", "7"];
const ACC_KEYS = ["8", "9", "10"];

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface EnhanceEntry {
  id: string;
  type: LUNAR_JADE_TYPE | null;
  amt: number;
  from: number;
  to: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const renderRefTable = (
  headers: string[],
  rows: React.ReactNode[][]
) => (
  <div className="overflow-x-auto rounded-md border">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-muted">
          {headers.map((h) => (
            <th
              key={h}
              className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap"
            >
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
                  ? (cell as number).toLocaleString()
                  : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const FragmentChips = ({ frags }: { frags: LunarFragmentData[] }) => (
  <div className="flex gap-1 flex-wrap">
    {frags.map((f) => (
      <span key={f.type} style={{ color: f.color }} className="font-medium">
        {f.type}
      </span>
    ))}
  </div>
);

// ─── Component ──────────────────────────────────────────────────────────────

const LunarJadeCalculatorContent = () => {
  // Craft state
  const [dataSource, setDataSource] =
    useState<LunarJadeCalculator[]>(dataCalculator);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [qtVal, setQtVal] = useState("min");
  const [selectFrom, setSelectFrom] = useState<ITEM_RARITY>(ITEM_RARITY.CRAFT);
  const [selectTo, setSelectTo] = useState<ITEM_RARITY>(ITEM_RARITY.NORMAL);
  const [changeOrb, setChangeOrb] = useState(false);
  const [changeEnergy, setChangeEnergy] = useState(false);

  // Enhance state
  const nextId = useRef(2);
  const [enhanceEntries, setEnhanceEntries] = useState<EnhanceEntry[]>([
    { id: "1", type: null, amt: 1, from: 0, to: 1 },
  ]);

  // ─── Craft helpers ────────────────────────────────────────────────────────

  const toggleRow = (key: string, checked: boolean) => {
    setSelectedRowKeys((prev) =>
      checked ? [...prev, key] : prev.filter((k) => k !== key)
    );
  };

  const toggleGroup = (keys: string[], checked: boolean) => {
    setSelectedRowKeys((prev) =>
      checked
        ? [...new Set([...prev, ...keys])]
        : prev.filter((k) => !keys.includes(k))
    );
  };

  const updateRow = (key: string, updates: Partial<LunarJadeCalculator>) => {
    setDataSource((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...updates } : r))
    );
  };

  const applyFromTo = (from: ITEM_RARITY, to: ITEM_RARITY) => {
    setSelectFrom(from);
    setSelectTo(to);
    setDataSource((prev) => prev.map((r) => ({ ...r, from, to })));
  };

  const setQtyPreset = (qt: string) => {
    setQtVal(qt);
    setDataSource((prev) =>
      prev.map((r) => ({
        ...r,
        defaultValue:
          qt === "min"
            ? r.min
            : qt === "max"
            ? r.max
            : r.equipment === EQUIPMENT.RING1
            ? 2
            : 1,
      }))
    );
  };

  const quickSelect = (keys: string[] | null) => {
    setSelectedRowKeys(keys ?? []);
  };

  // ─── Craft calculations ───────────────────────────────────────────────────

  const invalidDtSrc = useMemo(() => {
    return selectedRowKeys.some((key) => {
      const row = dataSource.find((r) => r.key === key);
      if (!row) return false;
      const fr = equipmentCraftOpt.find((o) => o.value === row.from);
      const to = equipmentCraftOpt.find((o) => o.value === row.to);
      return (to?.rateValue ?? 0) <= (fr?.rateValue ?? 0);
    });
  }, [selectedRowKeys, dataSource]);

  const craftMats = useMemo(() => {
    if (invalidDtSrc || selectedRowKeys.length === 0)
      return {
        fragments: [] as { frag: LunarFragmentData; amount: number; amountHg: number }[],
        gold: 0,
        stigmata: 0,
        orb: 0,
        concEnergy: 0,
        brokenOrb: 0,
        dimEnergy: 0,
      };

    const fragments: {
      frag: LunarFragmentData;
      amount: number;
      amountHg: number;
    }[] = [];

    let gold = 0;
    let stigmata = 0;
    let orbTotal = 0;
    let energyTotal = 0;

    selectedRowKeys.forEach((key) => {
      const row = dataSource.find((r) => r.key === key);
      if (!row) return;
      const { equipment, from, to, defaultValue } = row;

      let adding = false;
      let totalF = 0, totalHGF = 0, totalG = 0, totalS = 0;
      let totalOrb = 0, totalEnergy = 0;

      LunarJadeCraftAmountTable.forEach((item) => {
        if (adding) {
          totalF += item.quantity;
          totalHGF += item.quantityHg;
          totalG += item.gold;
          totalS += item.stigmata;
          totalOrb += item.tigerIntactOrb;
          totalEnergy += item.concentratedDimensionalEnergy;
        }
        if (item.rarity === from) adding = true;
        if (item.rarity === to) adding = false;
      });

      const mat = LunarJadeCraftMaterialList.find(
        (m) => m.equipmentType === equipment
      );
      mat?.lunarFragment.forEach((frag) => {
        const idx = fragments.findIndex((f) => f.frag.type === frag.type);
        if (idx === -1) {
          fragments.push({
            frag,
            amount: totalF * defaultValue,
            amountHg: totalHGF * defaultValue,
          });
        } else {
          fragments[idx].amount += totalF * defaultValue;
          fragments[idx].amountHg += totalHGF * defaultValue;
        }
      });

      gold += totalG * defaultValue;
      stigmata += totalS * defaultValue;
      orbTotal += totalOrb * defaultValue;
      energyTotal += totalEnergy * defaultValue;

      if (changeOrb) gold += defaultValue * orbTotal * tigerIntactOrbCraftMats.gold;
      if (changeEnergy)
        gold +=
          defaultValue * energyTotal * concentratedDimensionalEnergyCraftMats.gold;
    });

    const orb = changeOrb ? 0 : orbTotal;
    const concEnergy = changeEnergy ? 0 : energyTotal;
    const brokenOrb =
      (changeOrb ? orbTotal * tigerIntactOrbCraftMats.tigerIntactOrb : 0) +
      (changeEnergy
        ? energyTotal * concentratedDimensionalEnergyCraftMats.tigerIntactOrb
        : 0);
    const dimEnergy = changeEnergy
      ? energyTotal * concentratedDimensionalEnergyCraftMats.dimensionalEnergy
      : 0;

    return { fragments, gold, stigmata, orb, concEnergy, brokenOrb, dimEnergy };
  }, [selectedRowKeys, dataSource, invalidDtSrc, changeOrb, changeEnergy]);

  // ─── Enhance helpers ──────────────────────────────────────────────────────

  const addEntry = () => {
    setEnhanceEntries((prev) => [
      ...prev,
      { id: `${nextId.current++}`, type: null, amt: 1, from: 0, to: 1 },
    ]);
  };

  const removeEntry = (id: string) => {
    setEnhanceEntries((prev) =>
      prev.length > 1 ? prev.filter((e) => e.id !== id) : prev
    );
  };

  const updateEntry = (id: string, updates: Partial<EnhanceEntry>) => {
    setEnhanceEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  // ─── Enhance calculations ─────────────────────────────────────────────────

  const enhanceMats = useMemo(() => {
    let stigmata = 0, crystal = 0, remains = 0, gold = 0;
    let hgHoly = 0, hgBurn = 0, hgPitch = 0;
    let hgCrys = 0, hgTail = 0, hgArd = 0;
    let attack = 0, attPercent = 0, fd = 0, hsSkillPercent = 0;
    let attackPercent = 0, critical = 0, criticalDamage = 0;
    let hpPercent = 0, hp = 0, phyDef = 0, magDef = 0;
    const errors: string[] = [];

    enhanceEntries.forEach((entry, idx) => {
      if (!entry.type) {
        errors.push(`Entry ${idx + 1}: select a jade type`);
        return;
      }
      if (entry.from >= entry.to) {
        errors.push(`Entry ${idx + 1}: From must be less than To`);
        return;
      }
      if (entry.amt <= 0) {
        errors.push(`Entry ${idx + 1}: amount must be at least 1`);
        return;
      }

      const isAtt = entry.type === LUNAR_JADE_TYPE.ATT;
      const matsTable = isAtt
        ? LunarJadeAttEnhancementMatsTable
        : LunarJadeDefEnhancementMatsTable;
      const statsTable = isAtt
        ? LunarJadeAttEnhancementStatsTable
        : LunarJadeDefEnhancementStatsTable;

      const sliced = matsTable.slice(entry.from + 1, entry.to + 1);
      let sc = 0, cr = 0, rm = 0, g = 0, hg = 0;
      sliced.forEach((r) => {
        sc += r.stigmata;
        cr += r.crystal;
        rm += r.remains;
        g += r.gold;
        hg += r.hgFragment;
      });
      stigmata += sc * entry.amt;
      crystal += cr * entry.amt;
      remains += rm * entry.amt;
      gold += g * entry.amt;
      const totalHg = hg * entry.amt;
      if (isAtt) {
        hgHoly += totalHg;
        hgBurn += totalHg;
        hgPitch += totalHg;
      } else {
        hgCrys += totalHg;
        hgTail += totalHg;
        hgArd += totalHg;
      }

      const dt1 = statsTable[entry.from];
      const dt2 = statsTable[entry.to];
      if (dt1 && dt2) {
        const d = (a?: number, b?: number) => ((a ?? 0) - (b ?? 0)) * entry.amt;
        attack += d(dt2.attack, dt1.attack);
        attPercent += d(dt2.attPercent, dt1.attPercent);
        fd += d(dt2.fd, dt1.fd);
        hsSkillPercent += d(dt2.hsSkillPercent, dt1.hsSkillPercent);
        attackPercent += d(dt2.attackPercent, dt1.attackPercent);
        critical += d(dt2.critical, dt1.critical);
        criticalDamage += d(dt2.criticalDamage, dt1.criticalDamage);
        hpPercent += d(dt2.hpPercent, dt1.hpPercent);
        hp += d(dt2.hp, dt1.hp);
        phyDef += d(dt2.phyDef, dt1.phyDef);
        magDef += d(dt2.magDef, dt1.magDef);
      }
    });

    return {
      errors,
      mats: { stigmata, crystal, remains, gold, hgHoly, hgBurn, hgPitch, hgCrys, hgTail, hgArd },
      stats: { attack, attPercent, fd, hsSkillPercent, attackPercent, critical, criticalDamage, hpPercent, hp, phyDef, magDef },
    };
  }, [enhanceEntries]);

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderMatItem = (label: string, value: number, color?: string) => {
    if (value === 0) return null;
    return (
      <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
        <span className="text-sm" style={color ? { color } : undefined}>
          {label}
        </span>
        <span className="text-sm font-medium tabular-nums">
          {value.toLocaleString()}
        </span>
      </div>
    );
  };

  const renderEmptyMats = () => (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
      <Package className="h-10 w-10 opacity-30" />
      <p className="text-sm">
        {selectedRowKeys.length === 0
          ? "Select equipment to calculate"
          : invalidDtSrc
          ? "Fix validation errors above"
          : "No materials required"}
      </p>
    </div>
  );

  const renderCraftGroup = (
    label: string,
    GroupIcon: React.ElementType,
    accentClass: string,
    keys: string[]
  ) => {
    const rows = dataSource.filter((r) => keys.includes(r.key));
    const allChecked = keys.every((k) => selectedRowKeys.includes(k));
    const someChecked = keys.some((k) => selectedRowKeys.includes(k));

    return (
      <div className="rounded-md border overflow-hidden">
        <div
          className={`flex items-center gap-2 px-4 py-2 border-b cursor-pointer ${accentClass}`}
          onClick={() => toggleGroup(keys, !allChecked)}
        >
          <Checkbox
            checked={allChecked ? true : someChecked ? "indeterminate" : false}
            onCheckedChange={(v) => toggleGroup(keys, Boolean(v))}
            onClick={(e) => e.stopPropagation()}
          />
          <GroupIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        {rows.map((row) => {
          const frOpt = equipmentCraftOpt.find((o) => o.value === row.from);
          const toOpt = equipmentCraftOpt.find((o) => o.value === row.to);
          const invalid =
            (toOpt?.rateValue ?? 0) <= (frOpt?.rateValue ?? 0);
          const isSelected = selectedRowKeys.includes(row.key);
          return (
            <div
              key={row.key}
              className={`flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors flex-wrap ${
                isSelected ? "bg-primary/5" : ""
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(v) => toggleRow(row.key, Boolean(v))}
              />
              <span className="flex-1 min-w-[100px] text-sm">
                {row.equipment}
              </span>
              <Tooltip
                title={`qty: ${row.min}–${row.max}`}
                placement="top"
                color="blue"
              >
                <InputNumber
                  value={row.defaultValue}
                  min={row.min}
                  max={row.max}
                  onChange={(v) =>
                    updateRow(row.key, { defaultValue: v ?? row.min })
                  }
                  size="small"
                  style={{ width: 60 }}
                />
              </Tooltip>
              <Select
                value={row.from}
                options={equipmentCraftOpt}
                onChange={(v) => updateRow(row.key, { from: v })}
                size="small"
                style={{ width: 90 }}
                status={invalid ? "error" : undefined}
              />
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select
                value={row.to}
                options={equipmentCraftOpt}
                onChange={(v) => updateRow(row.key, { to: v })}
                size="small"
                style={{ width: 90 }}
                status={invalid ? "error" : undefined}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // ─── JSX ─────────────────────────────────────────────────────────────────

  return (
    <Tabs defaultValue="craft" className="space-y-4">
      <TabsList>
        <TabsTrigger value="craft">Craft</TabsTrigger>
        <TabsTrigger value="enhance">Enhance</TabsTrigger>
        <TabsTrigger value="reference">Reference</TabsTrigger>
      </TabsList>

      {/* ── CRAFT ── */}
      <TabsContent value="craft" className="space-y-4">
        {/* Settings bar */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground w-16 shrink-0">
                Type
              </span>
              <div className="flex gap-1 flex-wrap">
                {[
                  { label: "Armor", keys: ARMOR_KEYS },
                  { label: "Weapon", keys: WEAPON_KEYS },
                  { label: "Accessories", keys: ACC_KEYS },
                  {
                    label: "All",
                    keys: [...ARMOR_KEYS, ...WEAPON_KEYS, ...ACC_KEYS],
                  },
                ].map(({ label, keys }) => (
                  <Button
                    key={label}
                    size="sm"
                    variant={
                      keys.every((k) => selectedRowKeys.includes(k))
                        ? "default"
                        : "outline"
                    }
                    onClick={() => quickSelect(keys)}
                  >
                    {label}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickSelect(null)}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground w-16 shrink-0">
                Quantity
              </span>
              <div className="flex gap-1">
                {["min", "mid", "max"].map((q) => (
                  <Button
                    key={q}
                    size="sm"
                    variant={qtVal === q ? "default" : "outline"}
                    onClick={() => setQtyPreset(q)}
                  >
                    {q.charAt(0).toUpperCase() + q.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground w-16 shrink-0">
                Apply all
              </span>
              <div className="flex items-center gap-2">
                <Select
                  value={selectFrom}
                  options={equipmentCraftOpt}
                  onChange={(v) => applyFromTo(v, selectTo)}
                  size="small"
                  style={{ width: 90 }}
                />
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <Select
                  value={selectTo}
                  options={equipmentCraftOpt}
                  onChange={(v) => applyFromTo(selectFrom, v)}
                  size="small"
                  style={{ width: 90 }}
                />
              </div>
              <div className="flex flex-wrap gap-4 ml-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={changeOrb}
                    onCheckedChange={(v) => setChangeOrb(Boolean(v))}
                  />
                  <span className="text-sm">Change Tiger Orb to Mats</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={changeEnergy}
                    onCheckedChange={(v) => setChangeEnergy(Boolean(v))}
                  />
                  <span className="text-sm">Change Conc. Dim. Energy to Mats</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Equipment selection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Equipment Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-3 pb-3">
              {renderCraftGroup(
                "Armor",
                Shield,
                "bg-blue-50 dark:bg-blue-950/30",
                ARMOR_KEYS
              )}
              {renderCraftGroup(
                "Weapon",
                Sword,
                "bg-red-50 dark:bg-red-950/30",
                WEAPON_KEYS
              )}
              {renderCraftGroup(
                "Accessories",
                Gem,
                "bg-purple-50 dark:bg-purple-950/30",
                ACC_KEYS
              )}
            </CardContent>
          </Card>

          {/* Right: Required materials */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Required Materials</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {selectedRowKeys.length === 0 || invalidDtSrc ? (
                renderEmptyMats()
              ) : (
                <div className="divide-y">
                  {craftMats.fragments.map((f) => (
                    <div
                      key={f.frag.type}
                      className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors"
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: f.frag.color }}
                      >
                        {f.frag.type}
                      </span>
                      <div className="flex gap-4 text-sm tabular-nums">
                        <span>{f.amount.toLocaleString()}</span>
                        {f.amountHg > 0 && (
                          <span className="text-muted-foreground">
                            {f.amountHg.toLocaleString()} HG
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {renderMatItem("Stigmata", craftMats.stigmata)}
                  {renderMatItem("Tiger Intact Orb", craftMats.orb)}
                  {renderMatItem("Conc. Dim. Energy", craftMats.concEnergy)}
                  {renderMatItem("Broken Orb", craftMats.brokenOrb)}
                  {renderMatItem("Dimensional Energy", craftMats.dimEnergy)}
                  {renderMatItem("Gold", craftMats.gold)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ── ENHANCE ── */}
      <TabsContent value="enhance" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Enhance entries */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Enhance Entries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
              {enhanceEntries.map((entry, idx) => {
                const invalid = entry.from >= entry.to;
                return (
                  <div
                    key={entry.id}
                    className="rounded-md border p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground font-medium w-16">
                        Entry {idx + 1}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={
                            entry.type === LUNAR_JADE_TYPE.ATT
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            updateEntry(entry.id, {
                              type: LUNAR_JADE_TYPE.ATT,
                            })
                          }
                        >
                          Attack
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            entry.type === LUNAR_JADE_TYPE.DEF
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            updateEntry(entry.id, {
                              type: LUNAR_JADE_TYPE.DEF,
                            })
                          }
                        >
                          Defense
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto"
                        onClick={() => removeEntry(entry.id)}
                        disabled={enhanceEntries.length <= 1}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pl-[72px]">
                      <Tooltip title="Number of jades" color="blue" placement="top">
                        <InputNumber
                          value={entry.amt}
                          min={1}
                          max={20}
                          onChange={(v) =>
                            updateEntry(entry.id, { amt: v ?? 1 })
                          }
                          size="small"
                          style={{ width: 65 }}
                          addonBefore="×"
                        />
                      </Tooltip>
                      <Select
                        value={entry.from}
                        options={enhOpts}
                        onChange={(v) => updateEntry(entry.id, { from: v })}
                        size="small"
                        style={{ width: 80 }}
                        status={invalid ? "error" : undefined}
                      />
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Select
                        value={entry.to}
                        options={enhOpts}
                        onChange={(v) => updateEntry(entry.id, { to: v })}
                        size="small"
                        style={{ width: 80 }}
                        status={invalid ? "error" : undefined}
                      />
                    </div>
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={addEntry}
                disabled={enhanceEntries.length >= 10}
              >
                + Add Entry
              </Button>
              {enhanceMats.errors.length > 0 && (
                <div className="space-y-1">
                  {enhanceMats.errors.map((e, i) => (
                    <p key={i} className="text-xs text-warning text-amber-600">
                      {e}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Materials + Stats */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Required Materials</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                {enhanceMats.errors.length > 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                    <Package className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Fix errors to see materials</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {renderMatItem(
                      "Lunar Eclipse Stigmata",
                      enhanceMats.mats.stigmata
                    )}
                    {renderMatItem(
                      "Lunar Eclipse Crystal",
                      enhanceMats.mats.crystal
                    )}
                    {renderMatItem(
                      "Lunar Eclipse Remains",
                      enhanceMats.mats.remains
                    )}
                    {enhanceMats.mats.hgHoly > 0 && (
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                        <span
                          className="text-sm"
                          style={{ color: LunarFragmentList.holy.color }}
                        >
                          HG Holy Lunar
                        </span>
                        <span className="text-sm font-medium tabular-nums">
                          {enhanceMats.mats.hgHoly.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {enhanceMats.mats.hgBurn > 0 && (
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                        <span
                          className="text-sm"
                          style={{ color: LunarFragmentList.burning.color }}
                        >
                          HG Burning Lunar
                        </span>
                        <span className="text-sm font-medium tabular-nums">
                          {enhanceMats.mats.hgBurn.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {enhanceMats.mats.hgPitch > 0 && (
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                        <span
                          className="text-sm"
                          style={{ color: LunarFragmentList.pitch.color }}
                        >
                          HG Pitch Black Lunar
                        </span>
                        <span className="text-sm font-medium tabular-nums">
                          {enhanceMats.mats.hgPitch.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {enhanceMats.mats.hgCrys > 0 && (
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                        <span
                          className="text-sm"
                          style={{ color: LunarFragmentList.crystal.color }}
                        >
                          HG Crystal Clear Lunar
                        </span>
                        <span className="text-sm font-medium tabular-nums">
                          {enhanceMats.mats.hgCrys.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {enhanceMats.mats.hgTail > 0 && (
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                        <span
                          className="text-sm"
                          style={{ color: LunarFragmentList.tailwind.color }}
                        >
                          HG Tailwind Lunar
                        </span>
                        <span className="text-sm font-medium tabular-nums">
                          {enhanceMats.mats.hgTail.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {enhanceMats.mats.hgArd > 0 && (
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                        <span
                          className="text-sm"
                          style={{ color: LunarFragmentList.ardent.color }}
                        >
                          HG Ardent Lunar
                        </span>
                        <span className="text-sm font-medium tabular-nums">
                          {enhanceMats.mats.hgArd.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {renderMatItem("Gold", enhanceMats.mats.gold)}
                  </div>
                )}
              </CardContent>
            </Card>

            <ListingCard
              title="Status Increase"
              data={[
                { title: "ATK", value: enhanceMats.stats.attack, format: true },
                {
                  title: "ATT",
                  value: enhanceMats.stats.attPercent,
                  suffix: "%",
                },
                { title: "FD", value: enhanceMats.stats.fd, format: true },
                {
                  title: "HS Skill",
                  value: enhanceMats.stats.hsSkillPercent,
                  format: true,
                },
                {
                  title: "ATK%",
                  value: enhanceMats.stats.attackPercent,
                  suffix: "%",
                },
                {
                  title: "CRT",
                  value: enhanceMats.stats.critical,
                  format: true,
                },
                {
                  title: "CDM",
                  value: enhanceMats.stats.criticalDamage,
                  format: true,
                },
                {
                  title: "HP%",
                  value: enhanceMats.stats.hpPercent,
                  suffix: "%",
                },
                { title: "HP", value: enhanceMats.stats.hp, format: true },
                {
                  title: "Phy Def",
                  value: enhanceMats.stats.phyDef,
                  format: true,
                },
                {
                  title: "Mag Def",
                  value: enhanceMats.stats.magDef,
                  format: true,
                },
              ]}
            />

            {enhanceMats.errors.length === 0 && (
              <TradingHouseCalc
                data={[
                  {
                    name: "Lunar Eclipse Crystal",
                    amt: enhanceMats.mats.crystal,
                  },
                  {
                    name: "Lunar Eclipse Remains",
                    amt: enhanceMats.mats.remains,
                  },
                  { name: "HG Holy Lunar", amt: enhanceMats.mats.hgHoly },
                  { name: "HG Burning Lunar", amt: enhanceMats.mats.hgBurn },
                  {
                    name: "HG Pitch Black Lunar",
                    amt: enhanceMats.mats.hgPitch,
                  },
                  {
                    name: "HG Crystal Clear Lunar",
                    amt: enhanceMats.mats.hgCrys,
                  },
                  { name: "HG Tailwind Lunar", amt: enhanceMats.mats.hgTail },
                  { name: "HG Ardent Lunar", amt: enhanceMats.mats.hgArd },
                ]}
                additionalTotal={enhanceMats.mats.gold}
              />
            )}
          </div>
        </div>
      </TabsContent>

      {/* ── REFERENCE ── */}
      <TabsContent value="reference">
        <Tabs defaultValue="craft-ref" className="space-y-4">
          <TabsList>
            <TabsTrigger value="craft-ref">Craft</TabsTrigger>
            <TabsTrigger value="att-mats">Att Mats</TabsTrigger>
            <TabsTrigger value="def-mats">Def Mats</TabsTrigger>
            <TabsTrigger value="att-stats">Att Stats</TabsTrigger>
            <TabsTrigger value="def-stats">Def Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="craft-ref" className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Fragment Amount per Stage
            </h3>
            {renderRefTable(
              [
                "Rarity",
                "Fragment",
                "HG Fragment",
                "Stigmata",
                "Gold",
                "Tiger Orb",
                "Conc. Dim. Energy",
              ],
              LunarJadeCraftAmountTable.map((r) => [
                <span style={{ color: getColor(r.rarity, "") }}>{r.rarity}</span>,
                r.quantity,
                r.quantityHg,
                r.stigmata,
                r.gold,
                r.tigerIntactOrb,
                r.concentratedDimensionalEnergy,
              ])
            )}

            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-4">
              Equipment Fragment Types
            </h3>
            {renderRefTable(
              ["Equipment", "Fragment Materials"],
              LunarJadeCraftMaterialList.map((r) => [
                r.equipmentType,
                <FragmentChips frags={r.lunarFragment} />,
              ])
            )}

            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-4">
              Jade Fragment Types
            </h3>
            {renderRefTable(
              ["Jade Type", "Fragment Materials"],
              LunarJadeEnhanceMaterialList.map((r) => [
                r.jadeType,
                <FragmentChips frags={r.lunarFragment} />,
              ])
            )}
          </TabsContent>

          <TabsContent value="att-mats">
            {renderRefTable(
              [
                "Enhancement",
                "Stigmata",
                "Crystal",
                "HG Fragment",
                "Gold",
              ],
              LunarJadeAttEnhancementMatsTable.map((r) => [
                `+${r.encLevel}`,
                r.stigmata,
                r.crystal,
                r.hgFragment,
                r.gold,
              ])
            )}
          </TabsContent>

          <TabsContent value="def-mats">
            {renderRefTable(
              [
                "Enhancement",
                "Stigmata",
                "Remains",
                "HG Fragment",
                "Gold",
              ],
              LunarJadeDefEnhancementMatsTable.map((r) => [
                `+${r.encLevel}`,
                r.stigmata,
                r.remains,
                r.hgFragment,
                r.gold,
              ])
            )}
          </TabsContent>

          <TabsContent value="att-stats">
            {renderRefTable(
              [
                "Enhancement",
                "ATK",
                "Att ATK%",
                "ATK%",
                "CRT",
                "CDM",
                "FD",
                "HS Skill ATK",
              ],
              LunarJadeAttEnhancementStatsTable.map((r) => [
                `+${r.encLevel}`,
                r.attack,
                getTextEmpty({ txt: r.attPercent, tailText: "%" }),
                getTextEmpty({ txt: r.attackPercent, tailText: "%" }),
                r.critical,
                r.criticalDamage,
                r.fd,
                getTextEmpty({ txt: r.hsSkillPercent, tailText: "%" }),
              ])
            )}
          </TabsContent>

          <TabsContent value="def-stats">
            {renderRefTable(
              [
                "Enhancement",
                "ATK",
                "Att ATK%",
                "HP%",
                "HP",
                "Phy Def",
                "Mag Def",
                "FD",
                "HS Skill ATK",
              ],
              LunarJadeDefEnhancementStatsTable.map((r) => [
                `+${r.encLevel}`,
                r.attack,
                getTextEmpty({ txt: r.attPercent, tailText: "%" }),
                getTextEmpty({ txt: r.hpPercent, tailText: "%" }),
                r.hp,
                r.phyDef,
                r.magDef,
                r.fd,
                getTextEmpty({ txt: r.hsSkillPercent, tailText: "%" }),
              ])
            )}
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
};

export default LunarJadeCalculatorContent;
