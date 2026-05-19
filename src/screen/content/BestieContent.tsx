import { Select } from "antd";
import { Package, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingCard from "../../components/ListingCard";
import { BESTIE_TYPE } from "../../constants/InGame.constants";
import {
  BestieGrowthTableMats,
  BestieMountV1TableStats,
  BestieMountV2TableStats,
  BestieSpiritV1TableStats,
  BestieSpiritV2TableStats,
} from "../../data/BestieCalculatorData";

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface GrowEntry {
  id: number;
  type: BESTIE_TYPE;
  version: "v1" | "v2" | "v3";
  from: number;
  to: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const growOpts = Array.from({ length: 31 }, (_, i) => ({ value: i, label: `+${i}` }));

const getStatTable = (type: BESTIE_TYPE, version: "v1" | "v2" | "v3") => {
  const isMount = type === BESTIE_TYPE.MNT;
  return version === "v1"
    ? isMount ? BestieMountV1TableStats : BestieSpiritV1TableStats
    : isMount ? BestieMountV2TableStats : BestieSpiritV2TableStats;
};

// ─── Component ────────────────────────────────────────────────────────────────

const BestieContent = () => {
  const nextId = useRef(2);
  const [entries, setEntries] = useState<GrowEntry[]>([
    { id: 1, type: BESTIE_TYPE.MNT, version: "v1", from: 0, to: 30 },
  ]);

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { id: nextId.current++, type: BESTIE_TYPE.MNT, version: "v1", from: 0, to: 30 },
    ]);
  };

  const removeEntry = (id: number) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const updateEntry = (id: number, patch: Partial<GrowEntry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const validEntries = useMemo(() => entries.filter((e) => e.from < e.to), [entries]);

  const mats = useMemo(() => {
    let faded = 0, shining = 0, unbeatable = 0;
    validEntries.forEach(({ from, to }) => {
      BestieGrowthTableMats.slice(from, to).forEach((r) => {
        faded += r.faded;
        shining += r.shining;
        unbeatable += r.unbeatable;
      });
    });
    return { faded, shining, unbeatable };
  }, [validEntries]);

  const statDiff = useMemo(() => {
    let phyMagAtk = 0, phyMagAtkPercent = 0, attAtkPercent = 0, fd = 0;
    let crt = 0, cdm = 0, moveSpeedPercent = 0, hp = 0, hpPercent = 0;
    validEntries.forEach(({ type, version, from, to }) => {
      const table = getStatTable(type, version);
      const dt1 = from > 0 && table.length >= from ? table[from - 1] : undefined;
      const dt2 = table.length >= to ? table[to - 1] : undefined;
      if (!dt2) return;
      const d = (a?: number, b?: number) => (a ?? 0) - (b ?? 0);
      phyMagAtk += d(dt2.phyMagAtk, dt1?.phyMagAtk);
      phyMagAtkPercent += d(dt2.phyMagAtkPercent, dt1?.phyMagAtkPercent);
      attAtkPercent += d(dt2.attAtkPercent, dt1?.attAtkPercent);
      fd += d(dt2.fd, dt1?.fd);
      crt += d(dt2.crt, dt1?.crt);
      cdm += d(dt2.cdm, dt1?.cdm);
      moveSpeedPercent += d(dt2.moveSpeedPercent, dt1?.moveSpeedPercent);
      hp += d(dt2.hp, dt1?.hp);
      hpPercent += d(dt2.hpPercent, dt1?.hpPercent);
    });
    return { phyMagAtk, phyMagAtkPercent, attAtkPercent, fd, crt, cdm, moveSpeedPercent, hp, hpPercent };
  }, [validEntries]);

  const matRows = [
    { name: "Faded Bestie Star", amount: mats.faded },
    { name: "Shining Bestie Star", amount: mats.shining },
    { name: "Unbeatable Bestie Star", amount: mats.unbeatable },
  ].filter((r) => r.amount > 0);

  return (
    <Tabs defaultValue="calculator" className="space-y-4">
      <TabsList>
        <TabsTrigger value="calculator">Calculator</TabsTrigger>
        <TabsTrigger value="reference">Reference</TabsTrigger>
      </TabsList>

      {/* ── CALCULATOR ── */}
      <TabsContent value="calculator">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: grow entries */}
          <div className="flex flex-col gap-3">
            {entries.map((entry, idx) => {
              const isErr = entry.from >= entry.to;
              return (
                <Card key={entry.id}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">Grow {idx + 1}</CardTitle>
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-16 shrink-0">Type</span>
                      <div className="flex gap-1">
                        {([BESTIE_TYPE.MNT, BESTIE_TYPE.SPT] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => updateEntry(entry.id, { type: t })}
                            className={`px-3 py-1 rounded text-sm border transition-colors ${
                              entry.type === t
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-16 shrink-0">Version</span>
                      <div className="flex gap-1">
                        {(["v1", "v2", "v3"] as const).map((v) => (
                          <button
                            key={v}
                            onClick={() => updateEntry(entry.id, { version: v })}
                            className={`px-3 py-1 rounded text-sm border transition-colors ${
                              entry.version === v
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted"
                            }`}
                          >
                            {v.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-muted-foreground w-16 shrink-0">Range</span>
                      <div className="flex items-center gap-2">
                        <Select
                          value={entry.from}
                          options={growOpts}
                          onChange={(v) => updateEntry(entry.id, { from: v })}
                          style={{ width: 90 }}
                          size="small"
                          status={isErr ? "error" : undefined}
                        />
                        <span className="text-sm text-muted-foreground">→</span>
                        <Select
                          value={entry.to}
                          options={growOpts}
                          onChange={(v) => updateEntry(entry.id, { to: v })}
                          style={{ width: 90 }}
                          size="small"
                          status={isErr ? "error" : undefined}
                        />
                        {isErr && <span className="text-xs text-destructive">From must be less than To</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <button
              onClick={addEntry}
              disabled={entries.length >= 3}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-md border border-dashed text-sm text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add Grow Entry
            </button>
          </div>

          {/* Right: materials + stats */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Required Materials</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                {matRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                    <Package className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No materials required</p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y">
                      {matRows.map((r) => (
                        <div key={r.name} className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                          <span className="text-sm">{r.name}</span>
                          <span className="text-sm font-medium tabular-nums">{r.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <p className="px-4 pt-2 text-xs text-muted-foreground italic">
                      * Growth uses one Bestie Star type; same for both Mount & Spirit
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <ListingCard
              title="Status Increase"
              data={[
                { title: "ATK", value: statDiff.phyMagAtk, format: true },
                { title: "ATK", value: statDiff.phyMagAtkPercent, suffix: "%" },
                { title: "ATT", value: statDiff.attAtkPercent, suffix: "%" },
                { title: "FD", value: statDiff.fd, format: true },
                { title: "CRT", value: statDiff.crt, format: true },
                { title: "CDM", value: statDiff.cdm, format: true },
                { title: "MvSpeed", value: statDiff.moveSpeedPercent, suffix: "%" },
                { title: "HP", value: statDiff.hp, format: true },
                { title: "HP", value: statDiff.hpPercent, suffix: "%" },
              ]}
            />
          </div>
        </div>
      </TabsContent>

      {/* ── REFERENCE ── */}
      <TabsContent value="reference">
        <Tabs defaultValue="growth-mats" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="growth-mats">Growth Mats</TabsTrigger>
            <TabsTrigger value="mount-v1">Mount V1</TabsTrigger>
            <TabsTrigger value="mount-v2">Mount V2/V3</TabsTrigger>
            <TabsTrigger value="spirit-v1">Spirit V1</TabsTrigger>
            <TabsTrigger value="spirit-v2">Spirit V2/V3</TabsTrigger>
          </TabsList>

          <TabsContent value="growth-mats">
            <p className="text-sm text-muted-foreground italic mb-3">
              * Growth only uses one Bestie Star type; same for both Mount & Spirit
            </p>
            {renderRefTable(
              ["Enhancement", "Faded Bestie Star", "Shining Bestie Star", "Unbeatable Bestie Star"],
              BestieGrowthTableMats.map((r) => [`+${r.encLevel}`, r.faded, r.shining, r.unbeatable])
            )}
          </TabsContent>

          <TabsContent value="mount-v1">
            {renderRefTable(
              ["Enhancement", "ATK", "ATK(%)", "Attribute(%)", "CRT", "CDM", "FD", "Movespeed(%)"],
              BestieMountV1TableStats.map((r) => [
                `+${r.encLevel}`,
                r.phyMagAtk,
                r.phyMagAtkPercent !== undefined ? `${r.phyMagAtkPercent}%` : null,
                r.attAtkPercent !== undefined ? `${r.attAtkPercent}%` : null,
                r.crt,
                r.cdm,
                r.fd,
                r.moveSpeedPercent !== undefined ? `${r.moveSpeedPercent}%` : null,
              ])
            )}
          </TabsContent>

          <TabsContent value="mount-v2">
            {renderRefTable(
              ["Enhancement", "ATK", "ATK(%)", "Attribute(%)", "CRT", "CDM", "FD", "Movespeed(%)"],
              BestieMountV2TableStats.map((r) => [
                `+${r.encLevel}`,
                r.phyMagAtk,
                r.phyMagAtkPercent !== undefined ? `${r.phyMagAtkPercent}%` : null,
                r.attAtkPercent !== undefined ? `${r.attAtkPercent}%` : null,
                r.crt,
                r.cdm,
                r.fd,
                r.moveSpeedPercent !== undefined ? `${r.moveSpeedPercent}%` : null,
              ])
            )}
          </TabsContent>

          <TabsContent value="spirit-v1">
            {renderRefTable(
              ["Enhancement", "ATK", "ATK(%)", "Attribute(%)", "FD", "HP", "HP(%)"],
              BestieSpiritV1TableStats.map((r) => [
                `+${r.encLevel}`,
                r.phyMagAtk,
                r.phyMagAtkPercent !== undefined ? `${r.phyMagAtkPercent}%` : null,
                r.attAtkPercent !== undefined ? `${r.attAtkPercent}%` : null,
                r.fd,
                r.hp,
                r.hpPercent !== undefined ? `${r.hpPercent}%` : null,
              ])
            )}
          </TabsContent>

          <TabsContent value="spirit-v2">
            {renderRefTable(
              ["Enhancement", "ATK", "ATK(%)", "Attribute(%)", "FD", "HP", "HP(%)"],
              BestieSpiritV2TableStats.map((r) => [
                `+${r.encLevel}`,
                r.phyMagAtk,
                r.phyMagAtkPercent !== undefined ? `${r.phyMagAtkPercent}%` : null,
                r.attAtkPercent !== undefined ? `${r.attAtkPercent}%` : null,
                r.fd,
                r.hp,
                r.hpPercent !== undefined ? `${r.hpPercent}%` : null,
              ])
            )}
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
};

export default BestieContent;
