import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkillJadeCalcComp from "../../components/SkillJadeCalcComp";
import {
  AncientDJSkillMaterialTable,
  AncientDJSkillStatTable,
  DimeOtherDJSkillMaterialTable,
  DimeOtherDJSkillStatTable,
  DMFDJSkillMaterialTable,
  DMFDJSkillStatTable,
} from "../../data/SkillJadeData";
import { SkillJadeEnhanceMaterial } from "../../interface/Item.interface";
import { SkillJadeStat } from "../../interface/ItemStat.interface";

// ─── Calculators config ──────────────────────────────────────────────────────

const CALCS = [
  {
    value: "dreamy",
    label: "Dreamy",
    matsTable: DMFDJSkillMaterialTable,
    statsTable: DMFDJSkillStatTable,
    lFragName: "Dreamy Core",
    hFragName: "High Purity Dreamy Core",
  },
  {
    value: "blood-moon",
    label: "Blood Moon",
    matsTable: DMFDJSkillMaterialTable,
    statsTable: DMFDJSkillStatTable,
    lFragName: "Blood Moon Core",
    hFragName: "High Purity Blood Moon Core",
  },
  {
    value: "verdure",
    label: "Verdure",
    matsTable: DMFDJSkillMaterialTable,
    statsTable: DMFDJSkillStatTable,
    lFragName: "Verdure Core",
    hFragName: "High Purity Verdure Core",
  },
  {
    value: "ancient",
    label: "Ancient",
    matsTable: AncientDJSkillMaterialTable,
    statsTable: AncientDJSkillStatTable,
    lFragName: "Ancient Broken Dragon Jade Fragments",
    hFragName: "Ancient Dragon Jade Fragments",
    hideCD: true,
    hideTH: true,
  },
  {
    value: "dimensional",
    label: "Dimensional",
    matsTable: DimeOtherDJSkillMaterialTable,
    statsTable: DimeOtherDJSkillStatTable,
    lFragName: "Dimensional Core",
    hFragName: "High Purity Dimensional Core",
  },
  {
    value: "otherworldly",
    label: "Otherworldly",
    matsTable: DimeOtherDJSkillMaterialTable,
    statsTable: DimeOtherDJSkillStatTable,
    lFragName: "Otherworldly Core",
    hFragName: "High Purity Otherworldly Core",
  },
] as const;

// ─── Reference table helper ──────────────────────────────────────────────────

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

// ─── Reference sections ──────────────────────────────────────────────────────

const REF_SECTIONS = [
  {
    value: "dmf-stats",
    label: "DMF Stats",
    title: "Dreamy / Blood Moon / Verdure",
    renderRows: (t: SkillJadeStat[]) =>
      t.map((r) => [
        `+${r.encLevel}`,
        `${r.attackPercent}%`,
        `${r.cooldownPercent}%`,
        `${r.successRate}%`,
      ]),
    headers: ["Enhancement", "ATK%", "Cooldown -", "Success Rate"],
    table: DMFDJSkillStatTable as SkillJadeStat[],
  },
  {
    value: "dmf-mats",
    label: "DMF Mats",
    title: "Dreamy / Blood Moon / Verdure",
    renderRows: (t: SkillJadeEnhanceMaterial[]) =>
      t.map((r) => [`+${r.encLevel}`, r.lowerFragment || "-", r.higherFragment || "-", r.gold]),
    headers: ["Enhancement", "Core", "HG Core", "Gold"],
    table: DMFDJSkillMaterialTable as SkillJadeEnhanceMaterial[],
  },
  {
    value: "anc-stats",
    label: "Ancient Stats",
    title: "Ancient Dragon Jade",
    renderRows: (t: SkillJadeStat[]) =>
      t.map((r) => [
        `+${r.encLevel}`,
        `${r.attackPercent}%`,
        `${r.successRate}%`,
      ]),
    headers: ["Enhancement", "ATK%", "Success Rate"],
    table: AncientDJSkillStatTable as SkillJadeStat[],
  },
  {
    value: "anc-mats",
    label: "Ancient Mats",
    title: "Ancient Dragon Jade",
    renderRows: (t: SkillJadeEnhanceMaterial[]) =>
      t.map((r) => [`+${r.encLevel}`, r.lowerFragment || "-", r.higherFragment || "-", r.gold]),
    headers: ["Enhancement", "Core", "HG Core", "Gold"],
    table: AncientDJSkillMaterialTable as SkillJadeEnhanceMaterial[],
  },
  {
    value: "dim-stats",
    label: "Dim/Other Stats",
    title: "Dimensional / Otherworldly",
    renderRows: (t: SkillJadeStat[]) =>
      t.map((r) => [
        `+${r.encLevel}`,
        `${r.attackPercent}%`,
        `${r.cooldownPercent}%`,
        `${r.successRate}%`,
      ]),
    headers: ["Enhancement", "ATK%", "Cooldown -", "Success Rate"],
    table: DimeOtherDJSkillStatTable as SkillJadeStat[],
  },
  {
    value: "dim-mats",
    label: "Dim/Other Mats",
    title: "Dimensional / Otherworldly",
    renderRows: (t: SkillJadeEnhanceMaterial[]) =>
      t.map((r) => [`+${r.encLevel}`, r.lowerFragment || "-", r.higherFragment || "-", r.gold]),
    headers: ["Enhancement", "Core", "HG Core", "Gold"],
    table: DimeOtherDJSkillMaterialTable as SkillJadeEnhanceMaterial[],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SkillJadeContent = () => {
  return (
    <Tabs defaultValue="dreamy" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        {CALCS.map((c) => (
          <TabsTrigger key={c.value} value={c.value}>
            {c.label}
          </TabsTrigger>
        ))}
        <TabsTrigger value="reference">Reference</TabsTrigger>
      </TabsList>

      {/* Calculator tabs */}
      {CALCS.map((c) => (
        <TabsContent key={c.value} value={c.value}>
          <SkillJadeCalcComp
            matsTable={c.matsTable}
            statsTable={c.statsTable}
            lFragName={c.lFragName}
            hFragName={c.hFragName}
            hideCD={"hideCD" in c ? c.hideCD : undefined}
            hideTH={"hideTH" in c ? c.hideTH : undefined}
          />
        </TabsContent>
      ))}

      {/* Reference tab */}
      <TabsContent value="reference">
        <Tabs defaultValue="dmf-stats" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            {REF_SECTIONS.map((s) => (
              <TabsTrigger key={s.value} value={s.value}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {REF_SECTIONS.map((s) => (
            <TabsContent key={s.value} value={s.value} className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                {s.title}
              </p>
              {renderRefTable(
                s.headers,
                (s.renderRows as (t: any[]) => React.ReactNode[][])(s.table)
              )}
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>
    </Tabs>
  );
};

export default SkillJadeContent;
