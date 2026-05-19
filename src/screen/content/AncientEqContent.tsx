import { Select } from "antd";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Coins,
  Gem,
  Medal,
  Package,
  Shield,
  Swords,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EQUIPMENT } from "../../constants/InGame.constants";
import { dataAncCalculator } from "../../data/AncientCalculatorData";
import {
  AncientAccessoryCraftMaterialTable,
  AncientAccessoryCraftMaterialTableV2,
  AncientArmorCraftMaterialTable,
  AncientArmorCraftMaterialTableV2,
  AncientWeaponT2CraftMaterialTable,
  AncientWeaponT2CraftMaterialTableV2,
} from "../../data/AncientData";
import { AncientCalculator } from "../../interface/Common.interface";
import { AncientArmorCraftMaterial } from "../../interface/Item.interface";

interface TableMaterialList {
  "Helm Fragment": number;
  "Upper Fragment": number;
  "Lower Fragment": number;
  "Gloves Fragment": number;
  "Shoes Fragment": number;
  "Otherworldly Ancient Weapon Fragment": number;
  "Unknown Ancient Accessory Fragment": number;
  "Ancient Knowledge": number;
  "Ancient Insignia": number;
  Gold: number;
}

const ARMOR_KEYS = ["1", "2", "3", "4", "5"];
const WEAPON_KEYS = ["6", "7"];
const ACC_KEYS = ["8", "9", "10", "11"];
const ALL_KEYS = [...ARMOR_KEYS, ...WEAPON_KEYS, ...ACC_KEYS];

const opt = (start: number, end: number) =>
  Array.from({ length: end + 1 - start }, (_, k) => k + start).map((n) => ({
    label: `+${n}`,
    value: n,
  }));

const versionOpt = [
  { label: "New", value: "new" },
  { label: "Old", value: "old" },
];

const MATERIAL_META: {
  key: Exclude<keyof TableMaterialList, "Gold">;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}[] = [
  {
    key: "Helm Fragment",
    label: "Helm Fragment",
    icon: Shield,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500/10",
  },
  {
    key: "Upper Fragment",
    label: "Upper Fragment",
    icon: Shield,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500/10",
  },
  {
    key: "Lower Fragment",
    label: "Lower Fragment",
    icon: Shield,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500/10",
  },
  {
    key: "Gloves Fragment",
    label: "Gloves Fragment",
    icon: Shield,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500/10",
  },
  {
    key: "Shoes Fragment",
    label: "Shoes Fragment",
    icon: Shield,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500/10",
  },
  {
    key: "Otherworldly Ancient Weapon Fragment",
    label: "Weapon Fragment",
    icon: Swords,
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
  },
  {
    key: "Unknown Ancient Accessory Fragment",
    label: "Accessory Fragment",
    icon: Gem,
    colorClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
  },
  {
    key: "Ancient Knowledge",
    label: "Ancient Knowledge",
    icon: BookOpen,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
  {
    key: "Ancient Insignia",
    label: "Ancient Insignia",
    icon: Medal,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-600/10",
  },
];


// ── Component ─────────────────────────────────────────────────────────────────

const AncientEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<AncientCalculator[]>(dataAncCalculator);
  const [selectVersion, setSelectVersion] = useState<string>(
    versionOpt[0].value
  );
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(20);

  const handleSave = (row: AncientCalculator) => {
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

  const showWarningAcc = useMemo(
    () =>
      selectedRowKeys.some((key) => {
        const found = dataSource.find((dt) => dt.key === key);
        if (
          found &&
          (found.equipment === EQUIPMENT.NECKLACE ||
            found.equipment === EQUIPMENT.EARRING ||
            found.equipment === EQUIPMENT.RING1)
        ) {
          return found.from > 10 || found.to > 10;
        }
        return false;
      }),
    [selectedRowKeys, dataSource]
  );

  const tableResource: TableMaterialList = useMemo(() => {
    const temp: TableMaterialList = {
      "Helm Fragment": 0,
      "Upper Fragment": 0,
      "Lower Fragment": 0,
      "Gloves Fragment": 0,
      "Shoes Fragment": 0,
      "Otherworldly Ancient Weapon Fragment": 0,
      "Unknown Ancient Accessory Fragment": 0,
      "Ancient Knowledge": 0,
      "Ancient Insignia": 0,
      Gold: 0,
    };
    if (invalidDtSrc) return temp;

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!found) return;

      const { equipment, from, to } = found;
      let tempSlice: AncientArmorCraftMaterial[] = [];

      switch (equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          tempSlice = (
            selectVersion === versionOpt[0].value
              ? AncientArmorCraftMaterialTableV2
              : AncientArmorCraftMaterialTable
          ).slice(from, to);
          break;
        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          tempSlice = (
            selectVersion === versionOpt[0].value
              ? AncientWeaponT2CraftMaterialTableV2
              : AncientWeaponT2CraftMaterialTable
          ).slice(from, to);
          break;
        case EQUIPMENT.NECKLACE:
        case EQUIPMENT.EARRING:
        case EQUIPMENT.RING1:
          tempSlice = (
            selectVersion === versionOpt[0].value
              ? AncientAccessoryCraftMaterialTableV2
              : AncientAccessoryCraftMaterialTable
          ).slice(from, to);
          break;
        default:
          break;
      }

      let frag = 0,
        knowledge = 0,
        insignia = 0,
        gold = 0;
      tempSlice.forEach((s) => {
        frag += s.eqTypeFragment;
        knowledge += s.ancKnowledge;
        insignia += s.ancInsignia;
        gold += s.gold;
      });

      temp["Ancient Knowledge"] += knowledge;
      temp["Ancient Insignia"] += insignia;
      temp["Gold"] += gold;

      switch (equipment) {
        case EQUIPMENT.HELM:
          temp["Helm Fragment"] += frag;
          break;
        case EQUIPMENT.UPPER:
          temp["Upper Fragment"] += frag;
          break;
        case EQUIPMENT.LOWER:
          temp["Lower Fragment"] += frag;
          break;
        case EQUIPMENT.GLOVE:
          temp["Gloves Fragment"] += frag;
          break;
        case EQUIPMENT.SHOES:
          temp["Shoes Fragment"] += frag;
          break;
        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          temp["Otherworldly Ancient Weapon Fragment"] += frag;
          break;
        case EQUIPMENT.NECKLACE:
        case EQUIPMENT.EARRING:
        case EQUIPMENT.RING1:
          temp["Unknown Ancient Accessory Fragment"] += frag;
          break;
        default:
          break;
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc, selectVersion]);

  useEffect(() => {
    setDataSource((prev) =>
      prev.map((item) => ({ ...item, from: selectFrom, to: selectTo }))
    );
  }, [selectFrom, selectTo]);

  const hasMaterials = MATERIAL_META.some(({ key }) => tableResource[key] > 0);

  // ── Sub-components ───────────────────────────────────────────────────────────

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
        {/* Group header */}
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

        {/* Equipment rows */}
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
                    isSelected
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
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
                  style={{ width: 68 }}
                />
                <ArrowRight
                  size={12}
                  className="shrink-0 text-muted-foreground/60"
                />
                <Select
                  size="small"
                  value={row.to}
                  options={opt(row.min, row.max)}
                  onChange={(val) => handleSave({ ...row, to: val })}
                  status={isSelected && hasError ? "error" : undefined}
                  style={{ width: 68 }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRefTable = (
    label: string,
    data: AncientArmorCraftMaterial[],
    isNew: boolean
  ) => {
    const headerBg = isNew ? "bg-emerald-600 dark:bg-emerald-700" : "bg-amber-600 dark:bg-amber-700";
    const badgeCls = isNew
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/25"
      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/25";
    const cardAccent = isNew ? "bg-emerald-500/5" : "bg-amber-500/5";

    return (
      <Card className="overflow-hidden">
        <CardHeader className={cn("border-b py-3 px-4", cardAccent)}>
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset", badgeCls)}>
              {label}
            </span>
            Enhancement Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={cn("text-white text-xs", headerBg)}>
                  <th className="text-left px-4 py-2.5 font-semibold tracking-wide">Level</th>
                  <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Fragment</th>
                  <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Knowledge</th>
                  <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Insignia</th>
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
                      <span className={cn("inline-flex h-5 min-w-[2.25rem] items-center justify-center rounded px-1.5 font-mono text-[11px] font-bold ring-1 ring-inset", badgeCls)}>
                        +{row.encLevel}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.eqTypeFragment.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.ancKnowledge.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.ancInsignia.toLocaleString()}</td>
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

  const refTabContent = (
    newData: AncientArmorCraftMaterial[],
    oldData: AncientArmorCraftMaterial[]
  ) => (
    <div className="grid grid-cols-2 gap-4">
      {renderRefTable("New", newData, true)}
      {renderRefTable("Old", oldData, false)}
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Tabs defaultValue="calculator">
      <TabsList className="mb-4">
        <TabsTrigger value="calculator">Calculator</TabsTrigger>
        <TabsTrigger value="reference">Reference Tables</TabsTrigger>
      </TabsList>

      {/* ── Calculator ── */}
      <TabsContent value="calculator" className="mt-0">

        {/* Settings bar */}
        <Card size="sm" className="mb-4 bg-muted/30">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Version
                </span>
                <Select
                  value={selectVersion}
                  size="small"
                  style={{ width: 88 }}
                  onChange={setSelectVersion}
                  options={versionOpt}
                />
              </div>

              <Separator orientation="vertical" className="h-5 hidden sm:block" />

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">
                  Quick select
                </span>
                {[
                  { label: "Armor", keys: ARMOR_KEYS },
                  { label: "Weapon", keys: WEAPON_KEYS },
                  { label: "Accessories", keys: ACC_KEYS },
                  { label: "All", keys: ALL_KEYS },
                ].map(({ label, keys }) => (
                  <Button
                    key={label}
                    size="xs"
                    variant="outline"
                    onClick={() => setSelectedRowKeys(keys)}
                  >
                    {label}
                  </Button>
                ))}
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setSelectedRowKeys([])}
                >
                  Clear
                </Button>
              </div>

              <Separator orientation="vertical" className="h-5 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Apply to all
                </span>
                <Select
                  value={selectFrom}
                  size="small"
                  style={{ width: 68 }}
                  onChange={setSelectFrom}
                  options={opt(0, 20)}
                />
                <ArrowRight size={12} className="text-muted-foreground/60" />
                <Select
                  value={selectTo}
                  size="small"
                  style={{ width: 68 }}
                  onChange={setSelectTo}
                  options={opt(0, 20)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Equipment selection card */}
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
              <Separator />
              {renderGroup("Accessories", Gem, "bg-violet-400", ACC_KEYS)}
            </CardContent>
          </Card>

          {/* Required materials card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Package size={14} className="text-muted-foreground" />
                Required Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Alerts */}
              {invalidDtSrc && (
                <Alert variant="destructive" className="mb-3 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    "From" must be less than "To" for all selected equipment.
                  </AlertDescription>
                </Alert>
              )}
              {showWarningAcc && (
                <Alert className="mb-3 py-2 border-amber-500/40 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Accessories past +10 may break during enhancement.
                  </AlertDescription>
                </Alert>
              )}

              {/* Empty state */}
              {!hasMaterials && !invalidDtSrc && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Package size={36} className="mb-3 opacity-15" />
                  <p className="text-sm text-center leading-relaxed">
                    Select equipment and set an<br />enhancement range to begin.
                  </p>
                </div>
              )}

              {/* Material list */}
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

                  {/* Gold summary */}
                  {tableResource.Gold > 0 && (
                    <div className="mt-2 flex items-center justify-between py-2.5 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/30">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-full p-1.5 bg-amber-400/15">
                          <Coins size={12} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                          Gold
                        </span>
                      </div>
                      <span className="text-sm font-mono font-bold tabular-nums text-amber-700 dark:text-amber-400">
                        {tableResource.Gold.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ── Reference Tables ── */}
      <TabsContent value="reference" className="mt-0">
        <Tabs defaultValue="armor">
          <TabsList className="mb-4">
            <TabsTrigger value="armor">
              <Shield size={12} className="mr-1.5" />
              Armor
            </TabsTrigger>
            <TabsTrigger value="weapon">
              <Swords size={12} className="mr-1.5" />
              Weapon
            </TabsTrigger>
            <TabsTrigger value="accessories">
              <Gem size={12} className="mr-1.5" />
              Accessories
            </TabsTrigger>
          </TabsList>
          <TabsContent value="armor" className="mt-0">
            {refTabContent(
              AncientArmorCraftMaterialTableV2,
              AncientArmorCraftMaterialTable
            )}
          </TabsContent>
          <TabsContent value="weapon" className="mt-0">
            {refTabContent(
              AncientWeaponT2CraftMaterialTableV2,
              AncientWeaponT2CraftMaterialTable
            )}
          </TabsContent>
          <TabsContent value="accessories" className="mt-0">
            {refTabContent(
              AncientAccessoryCraftMaterialTableV2,
              AncientAccessoryCraftMaterialTable
            )}
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
};

export default AncientEqContent;
