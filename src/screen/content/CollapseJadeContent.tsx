import { InputNumber, Select } from "antd";
import { Package, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingCard from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import { EmptyCommonnStat } from "../../constants/Common.constants";
import { COLLAPSE_JADE_TYPE } from "../../constants/InGame.constants";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  combineEqStats,
  getComparedData,
  getStatDif,
  multiplyEqStats,
} from "../../utils/common.util";
import {
  CollapseJadeAttackStatsTable,
  CollapseJadeCraftMats,
  CollapseJadeDefendStatsTable,
  CollapseJadeEnhanceMatsTable,
} from "../../data/CollapseJadeData";

const enhOpts = Array.from({ length: 6 }, (_, i) => ({
  label: `+${i}`,
  value: i,
}));

interface EnhanceEntry {
  id: string;
  type: COLLAPSE_JADE_TYPE;
  amt: number;
  from: number;
  to: number;
  craft: boolean;
}

let nextId = 1;
const makeEntry = (): EnhanceEntry => ({
  id: String(nextId++),
  type: COLLAPSE_JADE_TYPE.ATT,
  amt: 1,
  from: 0,
  to: 5,
  craft: false,
});

const renderRefTable = (headers: string[], rows: (string | number | undefined)[][]) => (
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

const CollapseJadeContent = () => {
  const [entries, setEntries] = useState<EnhanceEntry[]>([makeEntry()]);

  const updateEntry = (id: string, patch: Partial<EnhanceEntry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const removeEntry = (id: string) =>
    setEntries((prev) => prev.filter((e) => e.id !== id));

  const addEntry = () => setEntries((prev) => [...prev, makeEntry()]);

  const { matsTotal, statsTotal } = useMemo(() => {
    let collapseFragment = 0;
    let foundationStone = 0;
    let dimVestige = 0;
    let gold = 0;
    let statsAcc: CommonItemStats = { ...EmptyCommonnStat };

    entries.forEach((e) => {
      const amt = Math.max(0, e.amt || 0);
      if (amt === 0 || e.from >= e.to) return;

      if (e.craft) {
        collapseFragment += CollapseJadeCraftMats.collapseFragment * amt;
        foundationStone += CollapseJadeCraftMats.foundationStone * amt;
        dimVestige += CollapseJadeCraftMats.dimVestige * amt;
        gold += CollapseJadeCraftMats.gold * amt;
      }

      const sliced = CollapseJadeEnhanceMatsTable.slice(e.from, e.to);
      let cf = 0, fs = 0, dv = 0, g = 0;
      sliced.forEach((r) => {
        cf += r.collapseFragment;
        fs += r.foundationStone;
        dv += r.dimVestige;
        g += r.gold;
      });
      collapseFragment += cf * amt;
      foundationStone += fs * amt;
      dimVestige += dv * amt;
      gold += g * amt;

      const statsTable =
        e.type === COLLAPSE_JADE_TYPE.ATT
          ? CollapseJadeAttackStatsTable
          : CollapseJadeDefendStatsTable;
      const { dt1, dt2 } = getComparedData(statsTable, e.from + 1, e.to + 1);
      if (dt2) {
        const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
        const scaled = multiplyEqStats(dt, amt);
        statsAcc = combineEqStats(statsAcc, scaled, "add");
      }
    });

    return {
      matsTotal: { collapseFragment, foundationStone, dimVestige, gold },
      statsTotal: statsAcc,
    };
  }, [entries]);

  const matRows = [
    { name: "Collapse Dragon Jade Fragment", amount: matsTotal.collapseFragment },
    { name: "Ancient's Foundation Stone", amount: matsTotal.foundationStone },
    { name: "Dimensional Vestige", amount: matsTotal.dimVestige },
    { name: "Gold", amount: matsTotal.gold },
  ].filter((r) => r.amount > 0);

  const hasEntries = entries.some((e) => e.amt > 0 && e.from < e.to);

  return (
    <Tabs defaultValue="calculator" className="space-y-4">
      <TabsList>
        <TabsTrigger value="calculator">Calculator</TabsTrigger>
        <TabsTrigger value="reference">Reference</TabsTrigger>
      </TabsList>

      {/* ── CALCULATOR ── */}
      <TabsContent value="calculator" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: entry list */}
          <div className="flex flex-col gap-3">
            {entries.map((e, idx) => {
              const isError = e.from >= e.to;
              return (
                <Card key={e.id}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm">Jade {idx + 1}</CardTitle>
                    {entries.length > 1 && (
                      <button
                        onClick={() => removeEntry(e.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Type toggle */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={e.type === COLLAPSE_JADE_TYPE.ATT ? "default" : "outline"}
                        onClick={() => updateEntry(e.id, { type: COLLAPSE_JADE_TYPE.ATT })}
                      >
                        Attack
                      </Button>
                      <Button
                        size="sm"
                        variant={e.type === COLLAPSE_JADE_TYPE.DEF ? "default" : "outline"}
                        onClick={() => updateEntry(e.id, { type: COLLAPSE_JADE_TYPE.DEF })}
                      >
                        Defense
                      </Button>
                    </div>

                    {/* Amount + From/To */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Qty</span>
                        <InputNumber
                          value={e.amt}
                          min={1}
                          max={20}
                          size="small"
                          style={{ width: 64 }}
                          onChange={(v) => updateEntry(e.id, { amt: v ?? 1 })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">From</span>
                        <Select
                          value={e.from}
                          options={enhOpts}
                          onChange={(v) => updateEntry(e.id, { from: v })}
                          style={{ width: 72 }}
                          size="small"
                          status={isError ? "error" : undefined}
                        />
                        <span className="text-sm text-muted-foreground">To</span>
                        <Select
                          value={e.to}
                          options={enhOpts}
                          onChange={(v) => updateEntry(e.id, { to: v })}
                          style={{ width: 72 }}
                          size="small"
                          status={isError ? "error" : undefined}
                        />
                      </div>
                    </div>
                    {isError && (
                      <p className="text-sm text-destructive">From must be less than To</p>
                    )}

                    {/* Craft checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox
                        checked={e.craft}
                        onCheckedChange={(v: boolean | "indeterminate") => updateEntry(e.id, { craft: Boolean(v) })}
                      />
                      <span className="text-sm">Include craft mats</span>
                    </label>
                  </CardContent>
                </Card>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={addEntry}
              disabled={entries.length >= 10}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Jade
            </Button>
          </div>

          {/* Right: materials + stats + trading house */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Required Materials</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                {!hasEntries || matRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                    <Package className="h-10 w-10 opacity-30" />
                    <p className="text-sm">No materials required</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {matRows.map((r) => (
                      <div
                        key={r.name}
                        className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm">{r.name}</span>
                        <span className="text-sm font-medium tabular-nums">
                          {r.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <ListingCard title="Status Increase" data={getStatDif(statsTotal)} />

            <TradingHouseCalc
              data={[
                {
                  name: "Dim. Vestige",
                  amt: matsTotal.dimVestige,
                },
              ]}
              additionalTotal={matsTotal.gold}
            />
          </div>
        </div>
      </TabsContent>

      {/* ── REFERENCE ── */}
      <TabsContent value="reference">
        <Tabs defaultValue="enh-mats" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="enh-mats">Enhance Mats</TabsTrigger>
            <TabsTrigger value="craft-mats">Craft Mats</TabsTrigger>
            <TabsTrigger value="att-stats">Attack Stats</TabsTrigger>
            <TabsTrigger value="def-stats">Defense Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="enh-mats">
            {renderRefTable(
              ["Enhancement", "Collapse Fragment", "Foundation Stone", "Dim. Vestige", "Gold"],
              CollapseJadeEnhanceMatsTable.map((r) => [
                `+${r.encLevel}`,
                r.collapseFragment,
                r.foundationStone,
                r.dimVestige,
                r.gold,
              ])
            )}
          </TabsContent>

          <TabsContent value="craft-mats">
            {renderRefTable(
              ["Material", "Amount"],
              [
                ["Collapse Dragon Jade Fragment", CollapseJadeCraftMats.collapseFragment],
                ["Ancient's Foundation Stone", CollapseJadeCraftMats.foundationStone],
                ["Dimensional Vestige", CollapseJadeCraftMats.dimVestige],
                ["Gold", CollapseJadeCraftMats.gold],
              ]
            )}
          </TabsContent>

          <TabsContent value="att-stats">
            {renderRefTable(
              ["Enhancement", "ATK", "ATK%", "CRT", "CDM", "Att ATK%", "FD"],
              CollapseJadeAttackStatsTable.map((r) => [
                `+${r.encLevel}`,
                r.phyMagAtk,
                r.phyMagAtkPercent !== undefined ? `${r.phyMagAtkPercent}%` : "-",
                r.crt,
                r.cdm,
                r.attAtkPercent !== undefined ? `${r.attAtkPercent}%` : "-",
                r.fd,
              ])
            )}
          </TabsContent>

          <TabsContent value="def-stats">
            {renderRefTable(
              ["Enhancement", "ATK", "HP%", "HP", "DEF", "MDEF", "Att ATK%", "FD"],
              CollapseJadeDefendStatsTable.map((r) => [
                `+${r.encLevel}`,
                r.phyMagAtk,
                r.hpPercent !== undefined ? `${r.hpPercent}%` : "-",
                r.hp,
                r.def,
                r.magdef,
                r.attAtkPercent !== undefined ? `${r.attAtkPercent}%` : "-",
                r.fd,
              ])
            )}
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
};

export default CollapseJadeContent;
