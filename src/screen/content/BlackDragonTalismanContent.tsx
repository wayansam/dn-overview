import { Select } from "antd";
import { AlertTriangle, Package } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingCard, { ItemList } from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import { ITEM_RARITY_COLOR } from "../../constants/InGame.color.constants";
import { ITEM_RARITY } from "../../constants/InGame.constants";
import {
  BDAncientElementTalismanStatTable,
  BDBaofaTalismanMatsTable,
  BDBaofaTalismanStatTable,
  BDKeenTalismanStatTable,
  BDMelukaTalismanMatsTable,
  BDMelukaTalismanStatTable,
  BDTitanionTalismanMatsTable,
  BDTitanionTalismanStatTable,
  BDUmbalaTalismanMatsTable,
  BDUmbalaTalismanStatTable,
} from "../../data/BlackDragonTalismanData";
import { BlackDragonTalismanCraftMaterial } from "../../interface/Item.interface";
import { BDTalismanStat } from "../../interface/ItemStat.interface";
import { getComparedData } from "../../utils/common.util";

// ─── Rarity select options ────────────────────────────────────────────────────

const RARITY_OPTS = [
  { value: 0, label: "Don't Have" },
  { value: 1, label: "Normal" },
  { value: 2, label: "Magic" },
  { value: 3, label: "Rare" },
  { value: 4, label: "Epic" },
  { value: 5, label: "Unique" },
  { value: 6, label: "Legend" },
];

const RARITY_COLOR: Record<string, string> = {
  [ITEM_RARITY.NORMAL]: ITEM_RARITY_COLOR.NORMAL,
  [ITEM_RARITY.MAGIC]: ITEM_RARITY_COLOR.MAGIC,
  [ITEM_RARITY.RARE]: ITEM_RARITY_COLOR.RARE,
  [ITEM_RARITY.EPIC]: ITEM_RARITY_COLOR.EPIC,
  [ITEM_RARITY.UNIQUE]: ITEM_RARITY_COLOR.UNIQUE,
  [ITEM_RARITY.LEGEND]: ITEM_RARITY_COLOR.LEGEND,
  [ITEM_RARITY.ANCIENT]: ITEM_RARITY_COLOR.ANCIENT,
};

// ─── Reference table helper ───────────────────────────────────────────────────

const renderRefTable = (headers: string[], rows: React.ReactNode[][]) => (
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
                {cell === undefined || cell === null ? "-" : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const rarityCell = (rarity: ITEM_RARITY) => (
  <span style={{ color: RARITY_COLOR[rarity] }}>{rarity}</span>
);

// ─── Shared calculator panel ──────────────────────────────────────────────────

interface BDCalcPanelProps {
  matsTable: BlackDragonTalismanCraftMaterial[];
  statTable: BDTalismanStat[];
  fragName: string;
  getStatItems: (dt1: BDTalismanStat | undefined, dt2: BDTalismanStat | undefined) => ItemList[];
}

const BDCalcPanel = ({ matsTable, statTable, fragName, getStatItems }: BDCalcPanelProps) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(5);

  const isError = from >= to;

  const mats = useMemo(() => {
    if (isError) return null;
    const slice = matsTable.slice(from, to);
    if (slice.some((r) => !r.craftable)) return null;
    let memories = 0, frag = 0, garnet = 0, essence = 0, gold = 0;
    slice.forEach((r) => {
      memories += r.bdMemories;
      frag += r.fragment;
      garnet += r.garnet;
      essence += r.essence;
      gold += r.gold;
    });
    return { memories, frag, garnet, essence, gold };
  }, [matsTable, from, to, isError]);

  const statItems = useMemo(() => {
    const { dt1, dt2 } = getComparedData(statTable, from, to);
    return getStatItems(dt1 as BDTalismanStat | undefined, dt2 as BDTalismanStat | undefined);
  }, [statTable, from, to, getStatItems]);

  const matRows = mats
    ? [
        { name: "Black Dragon Memories", amount: mats.memories },
        { name: fragName, amount: mats.frag },
        { name: "Garnet", amount: mats.garnet },
        { name: "Essence", amount: mats.essence },
        { name: "Gold", amount: mats.gold },
      ].filter((r) => r.amount > 0)
    : [];

  return (
    <div className="space-y-4">
      {/* Settings bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From</span>
              <Select
                value={from}
                options={RARITY_OPTS}
                onChange={setFrom}
                style={{ width: 110 }}
                size="small"
                status={isError ? "error" : undefined}
              />
              <span className="text-sm text-muted-foreground">To</span>
              <Select
                value={to}
                options={RARITY_OPTS}
                onChange={setTo}
                style={{ width: 110 }}
                size="small"
                status={isError ? "error" : undefined}
              />
            </div>
            {isError && (
              <span className="text-sm text-destructive">From must be less than To</span>
            )}
            {!isError && mats === null && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-sm">Legend Talisman is not craftable</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Materials */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Required Materials</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {isError || mats === null || matRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                <Package className="h-10 w-10 opacity-30" />
                <p className="text-sm">
                  {isError ? "Fix the range above" : mats === null ? "Contains non-craftable tier" : "No materials required"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {matRows.map((r) => (
                  <div key={r.name} className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                    <span className="text-sm">{r.name}</span>
                    <span className="text-sm font-medium tabular-nums">{r.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Stats + TH */}
        <div className="flex flex-col gap-4">
          <ListingCard title="Status Increase" data={statItems} />
          {mats && (
            <TradingHouseCalc
              data={[
                { name: "Black Dragon Memories", amt: mats.memories },
                { name: "Garnet", amt: mats.garnet },
                { name: "Essence", amt: mats.essence },
              ]}
              additionalTotal={mats.gold}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Stat item helpers ────────────────────────────────────────────────────────

const diff = (a: number | undefined, b: number | undefined) =>
  (a ?? 0) - (b ?? 0);

const mkBaofaStats = (dt1: BDTalismanStat | undefined, dt2: BDTalismanStat | undefined): ItemList[] => {
  const d1 = dt1 as any, d2 = dt2 as any;
  return [
    { title: "ATK", value: diff(d2?.attackPercent, d1?.attackPercent), suffix: "%" },
    { title: "MAX HP", value: diff(d2?.maxHPPercent, d1?.maxHPPercent), suffix: "%" },
    { title: "MAX HP", value: diff(d2?.maxHP, d1?.maxHP), format: true },
  ];
};
const mkUmbalaStats = (dt1: BDTalismanStat | undefined, dt2: BDTalismanStat | undefined): ItemList[] => {
  const d1 = dt1 as any, d2 = dt2 as any;
  return [
    { title: "ATK", value: diff(d2?.attackPercent, d1?.attackPercent), suffix: "%" },
    { title: "MAX HP", value: diff(d2?.maxHPPercent, d1?.maxHPPercent), suffix: "%" },
    { title: "Defense", value: diff(d2?.phyDef, d1?.phyDef), format: true },
  ];
};
const mkMelukaStats = (dt1: BDTalismanStat | undefined, dt2: BDTalismanStat | undefined): ItemList[] => {
  const d1 = dt1 as any, d2 = dt2 as any;
  return [
    { title: "ATK", value: diff(d2?.attackPercent, d1?.attackPercent), suffix: "%" },
    { title: "MAX HP", value: diff(d2?.maxHPPercent, d1?.maxHPPercent), suffix: "%" },
    { title: "Magic Defense", value: diff(d2?.magDef, d1?.magDef), format: true },
  ];
};
const mkTitanionStats = (dt1: BDTalismanStat | undefined, dt2: BDTalismanStat | undefined): ItemList[] => {
  const d1 = dt1 as any, d2 = dt2 as any;
  return [
    { title: "ATK", value: diff(d2?.attackPercent, d1?.attackPercent), suffix: "%" },
    { title: "MAX HP", value: diff(d2?.maxHPPercent, d1?.maxHPPercent), suffix: "%" },
    { title: "ATK", value: diff(d2?.attack, d1?.attack), format: true },
  ];
};

// ─── Component ────────────────────────────────────────────────────────────────

const BlackDragonTalismanContent = () => {
  return (
    <Tabs defaultValue="baofa" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="baofa">Baofa</TabsTrigger>
        <TabsTrigger value="umbala">Umbala</TabsTrigger>
        <TabsTrigger value="meluka">Meluka</TabsTrigger>
        <TabsTrigger value="titanion">Titanion</TabsTrigger>
        <TabsTrigger value="reference">Reference</TabsTrigger>
      </TabsList>

      <TabsContent value="baofa">
        <BDCalcPanel
          matsTable={BDBaofaTalismanMatsTable}
          statTable={BDBaofaTalismanStatTable}
          fragName="Baofa Fragment"
          getStatItems={mkBaofaStats}
        />
      </TabsContent>

      <TabsContent value="umbala">
        <BDCalcPanel
          matsTable={BDUmbalaTalismanMatsTable}
          statTable={BDUmbalaTalismanStatTable}
          fragName="Umbala Fragment"
          getStatItems={mkUmbalaStats}
        />
      </TabsContent>

      <TabsContent value="meluka">
        <BDCalcPanel
          matsTable={BDMelukaTalismanMatsTable}
          statTable={BDMelukaTalismanStatTable}
          fragName="Meluka Fragment"
          getStatItems={mkMelukaStats}
        />
      </TabsContent>

      <TabsContent value="titanion">
        <BDCalcPanel
          matsTable={BDTitanionTalismanMatsTable}
          statTable={BDTitanionTalismanStatTable}
          fragName="Titanion Fragment"
          getStatItems={mkTitanionStats}
        />
      </TabsContent>

      {/* ── REFERENCE ── */}
      <TabsContent value="reference">
        <Tabs defaultValue="stat-baofa" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="stat-baofa">Baofa Stats</TabsTrigger>
            <TabsTrigger value="stat-umbala">Umbala Stats</TabsTrigger>
            <TabsTrigger value="stat-meluka">Meluka Stats</TabsTrigger>
            <TabsTrigger value="stat-titanion">Titanion Stats</TabsTrigger>
            <TabsTrigger value="stat-keen">Keen Stats</TabsTrigger>
            <TabsTrigger value="stat-anc-ele">Anc. Element Stats</TabsTrigger>
            <TabsTrigger value="mats-baofa">Baofa Mats</TabsTrigger>
            <TabsTrigger value="mats-umbala">Umbala Mats</TabsTrigger>
            <TabsTrigger value="mats-meluka">Meluka Mats</TabsTrigger>
            <TabsTrigger value="mats-titanion">Titanion Mats</TabsTrigger>
          </TabsList>

          <TabsContent value="stat-baofa">
            {renderRefTable(
              ["Stage Rarity", "MAX HP", "MAX HP(%)", "ATK(%)", "Final Damage", "Craftable"],
              BDBaofaTalismanStatTable.map((r) => [
                rarityCell(r.rarity),
                r.maxHP != null ? r.maxHP.toLocaleString() : "-",
                r.maxHPPercent != null ? `${r.maxHPPercent}%` : "-",
                r.attackPercent != null ? `${r.attackPercent}%` : "-",
                r.fd != null ? r.fd.join(" / ") || "-" : "-",
                r.craftable ? "Yes" : "No",
              ])
            )}
          </TabsContent>

          <TabsContent value="stat-umbala">
            {renderRefTable(
              ["Stage Rarity", "Phy Def", "MAX HP(%)", "ATK(%)", "Final Damage", "Craftable"],
              BDUmbalaTalismanStatTable.map((r: any) => [
                rarityCell(r.rarity),
                r.phyDef != null ? r.phyDef.toLocaleString() : "-",
                r.maxHPPercent != null ? `${r.maxHPPercent}%` : "-",
                r.attackPercent != null ? `${r.attackPercent}%` : "-",
                r.fd != null ? r.fd.join(" / ") || "-" : "-",
                r.craftable ? "Yes" : "No",
              ])
            )}
          </TabsContent>

          <TabsContent value="stat-meluka">
            {renderRefTable(
              ["Stage Rarity", "Mag Def", "MAX HP(%)", "ATK(%)", "Final Damage", "Craftable"],
              BDMelukaTalismanStatTable.map((r: any) => [
                rarityCell(r.rarity),
                r.magDef != null ? r.magDef.toLocaleString() : "-",
                r.maxHPPercent != null ? `${r.maxHPPercent}%` : "-",
                r.attackPercent != null ? `${r.attackPercent}%` : "-",
                r.fd != null ? r.fd.join(" / ") || "-" : "-",
                r.craftable ? "Yes" : "No",
              ])
            )}
          </TabsContent>

          <TabsContent value="stat-titanion">
            {renderRefTable(
              ["Stage Rarity", "Attack", "MAX HP(%)", "ATK(%)", "Final Damage", "Craftable"],
              BDTitanionTalismanStatTable.map((r: any) => [
                rarityCell(r.rarity),
                r.attack != null ? r.attack.toLocaleString() : "-",
                r.maxHPPercent != null ? `${r.maxHPPercent}%` : "-",
                r.attackPercent != null ? `${r.attackPercent}%` : "-",
                r.fd != null ? r.fd.join(" / ") || "-" : "-",
                r.craftable ? "Yes" : "No",
              ])
            )}
          </TabsContent>

          <TabsContent value="stat-keen">
            {renderRefTable(
              ["Stage Rarity", "Attack", "CRT", "CDM", "MAX HP(%)", "ATK(%)", "Final Damage", "Craftable"],
              BDKeenTalismanStatTable.map((r: any) => [
                rarityCell(r.rarity),
                r.attack != null ? r.attack.toLocaleString() : "-",
                r.critical != null ? r.critical.toLocaleString() : "-",
                r.criticalDamage != null ? r.criticalDamage.toLocaleString() : "-",
                r.maxHPPercent != null ? `${r.maxHPPercent}%` : "-",
                r.attackPercent != null ? `${r.attackPercent}%` : "-",
                r.fd != null ? r.fd.join(" / ") || "-" : "-",
                r.craftable ? "Yes" : "No",
              ])
            )}
          </TabsContent>

          <TabsContent value="stat-anc-ele">
            {renderRefTable(
              ["Stage Rarity", "Element ATK", "Attack", "MAX HP(%)", "ATK(%)", "Final Damage", "Craftable"],
              BDAncientElementTalismanStatTable.map((r: any) => [
                rarityCell(r.rarity),
                r.attributePercent != null ? `${r.attributePercent}%` : "-",
                r.attack != null ? r.attack.toLocaleString() : "-",
                r.maxHPPercent != null ? `${r.maxHPPercent}%` : "-",
                r.attackPercent != null ? `${r.attackPercent}%` : "-",
                r.fd != null ? r.fd.join(" / ") || "-" : "-",
                r.craftable ? "Yes" : "No",
              ])
            )}
          </TabsContent>

          {(["baofa", "umbala", "meluka", "titanion"] as const).map((type) => {
            const tableMap = {
              baofa: { table: BDBaofaTalismanMatsTable, frag: "Baofa Fragment" },
              umbala: { table: BDUmbalaTalismanMatsTable, frag: "Umbala Fragment" },
              meluka: { table: BDMelukaTalismanMatsTable, frag: "Meluka Fragment" },
              titanion: { table: BDTitanionTalismanMatsTable, frag: "Titanion Fragment" },
            };
            const { table, frag } = tableMap[type];
            const filtered = table.filter((r) => r.craftable);
            return (
              <TabsContent key={`mats-${type}`} value={`mats-${type}`}>
                {renderRefTable(
                  ["Stage Rarity", "BD Memories", frag, "Garnet", "Essence", "Gold"],
                  filtered.map((r) => [
                    rarityCell(r.rarity),
                    r.bdMemories.toLocaleString(),
                    r.fragment.toLocaleString(),
                    r.garnet.toLocaleString(),
                    r.essence.toLocaleString(),
                    r.gold.toLocaleString(),
                  ])
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </TabsContent>
    </Tabs>
  );
};

export default BlackDragonTalismanContent;
