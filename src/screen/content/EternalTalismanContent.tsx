import { Select } from "antd";
import { Package } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingCard from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import {
  EternalChaosTalismanStatTable,
  EternalPainTalismanMatsTable,
  EternalPainTalismanStatTable,
  EternalWorldTalismanMatsTable,
  EternalWorldTalismanStatTable,
} from "../../data/EternalTalismanData";
import { getComparedData } from "../../utils/common.util";

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

// ─── World Talisman Calculator ────────────────────────────────────────────────

const WorldCalc = () => {
  const worldOpts = Array.from({ length: 11 }, (_, i) => ({
    value: i,
    label: i === 0 ? "Don't Have" : `lv.${i}`,
  }));

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(10);
  const isError = from >= to;

  const mats = useMemo(() => {
    if (isError) return { apparition: 0, gold: 0 };
    const slice = EternalWorldTalismanMatsTable.slice(from, to);
    let apparition = 0, gold = 0;
    slice.forEach((r) => { apparition += r.apparition; gold += r.gold; });
    return { apparition, gold };
  }, [from, to, isError]);

  const statDiff = useMemo(() => {
    const { dt1, dt2 } = getComparedData(EternalWorldTalismanStatTable, from, to);
    if (!dt2) return null;
    if (!dt1) return dt2;
    return {
      attack: (dt2.attack ?? 0) - (dt1.attack ?? 0),
      attributePercent: (dt2.attributePercent ?? 0) - (dt1.attributePercent ?? 0),
      maxHP: (dt2.maxHP ?? 0) - (dt1.maxHP ?? 0),
    };
  }, [from, to]);

  const matRows = [
    { name: "Eternal Dimensional Apparition", amount: mats.apparition },
    { name: "Gold", amount: mats.gold },
  ].filter((r) => r.amount > 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From</span>
              <Select value={from} options={worldOpts} onChange={setFrom} style={{ width: 100 }} size="small" status={isError ? "error" : undefined} />
              <span className="text-sm text-muted-foreground">To</span>
              <Select value={to} options={worldOpts} onChange={setTo} style={{ width: 100 }} size="small" status={isError ? "error" : undefined} />
            </div>
            {isError && <span className="text-sm text-destructive">From must be less than To</span>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Required Materials</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {isError || matRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                <Package className="h-10 w-10 opacity-30" />
                <p className="text-sm">{isError ? "Fix the range above" : "No materials required"}</p>
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

        <div className="flex flex-col gap-4">
          <ListingCard
            title="Status Increase"
            data={[
              { title: "ATK", value: statDiff?.attack, format: true },
              { title: "Attribute ATK", value: statDiff?.attributePercent, suffix: "%" },
              { title: "MAX HP", value: statDiff?.maxHP, format: true },
            ]}
          />
          <TradingHouseCalc
            data={[{ name: "Eternal Dimensional Apparition", amt: mats.apparition }]}
            additionalTotal={mats.gold}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Pain Talisman Calculator ─────────────────────────────────────────────────

const PainCalc = () => {
  const painOpts = Array.from({ length: 6 }, (_, i) => ({
    value: i,
    label: i === 0 ? "Don't Have" : `lv.${i}`,
  }));

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(5);
  const isError = from >= to;

  const mats = useMemo(() => {
    if (isError) return { apparition: 0, vortex: 0, gold: 0 };
    const slice = EternalPainTalismanMatsTable.slice(from, to);
    let apparition = 0, vortex = 0, gold = 0;
    slice.forEach((r) => { apparition += r.apparition; vortex += r.vortex; gold += r.gold; });
    return { apparition, vortex, gold };
  }, [from, to, isError]);

  const statDiff = useMemo(() => {
    const { dt1, dt2 } = getComparedData(EternalPainTalismanStatTable, from, to);
    if (!dt2) return null;
    if (!dt1) return dt2;
    return {
      attack: (dt2.attack ?? 0) - (dt1.attack ?? 0),
      fd: (dt2.fd ?? 0) - (dt1.fd ?? 0),
      maxHP: (dt2.maxHP ?? 0) - (dt1.maxHP ?? 0),
    };
  }, [from, to]);

  const matRows = [
    { name: "Eternal Dimensional Apparition", amount: mats.apparition },
    { name: "Eternal Pain Vortex", amount: mats.vortex },
    { name: "Gold", amount: mats.gold },
  ].filter((r) => r.amount > 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From</span>
              <Select value={from} options={painOpts} onChange={setFrom} style={{ width: 100 }} size="small" status={isError ? "error" : undefined} />
              <span className="text-sm text-muted-foreground">To</span>
              <Select value={to} options={painOpts} onChange={setTo} style={{ width: 100 }} size="small" status={isError ? "error" : undefined} />
            </div>
            {isError && <span className="text-sm text-destructive">From must be less than To</span>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Required Materials</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {isError || matRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                <Package className="h-10 w-10 opacity-30" />
                <p className="text-sm">{isError ? "Fix the range above" : "No materials required"}</p>
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

        <div className="flex flex-col gap-4">
          <ListingCard
            title="Status Increase"
            data={[
              { title: "ATK", value: statDiff?.attack, format: true },
              { title: "FD", value: statDiff?.fd, format: true },
              { title: "MAX HP", value: statDiff?.maxHP, format: true },
            ]}
          />
          <TradingHouseCalc
            data={[
              { name: "Eternal Dimensional Apparition", amt: mats.apparition },
              { name: "Eternal Pain Vortex", amt: mats.vortex },
            ]}
            additionalTotal={mats.gold}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const ExternalTalismanContent = () => {
  return (
    <Tabs defaultValue="world" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="world">Eternal World</TabsTrigger>
        <TabsTrigger value="pain">Eternal Pain</TabsTrigger>
        <TabsTrigger value="reference">Reference</TabsTrigger>
      </TabsList>

      <TabsContent value="world">
        <WorldCalc />
      </TabsContent>

      <TabsContent value="pain">
        <PainCalc />
      </TabsContent>

      {/* ── REFERENCE ── */}
      <TabsContent value="reference">
        <Tabs defaultValue="world-stats" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="world-stats">World Stats</TabsTrigger>
            <TabsTrigger value="pain-stats">Pain Stats</TabsTrigger>
            <TabsTrigger value="chaos-stats">Chaos Stats</TabsTrigger>
            <TabsTrigger value="world-mats">World Mats</TabsTrigger>
            <TabsTrigger value="pain-mats">Pain Mats</TabsTrigger>
          </TabsList>

          <TabsContent value="world-stats">
            {renderRefTable(
              ["Enhancement", "Attack", "Attribute ATK(%)", "MAX HP"],
              EternalWorldTalismanStatTable.map((r) => [
                `lv.${r.encLevel}`,
                r.attack,
                `${r.attributePercent}%`,
                r.maxHP,
              ])
            )}
          </TabsContent>

          <TabsContent value="pain-stats">
            {renderRefTable(
              ["Enhancement", "Attack", "Final Damage", "MAX HP"],
              EternalPainTalismanStatTable.map((r) => [
                `lv.${r.encLevel}`,
                r.attack,
                r.fd,
                r.maxHP,
              ])
            )}
          </TabsContent>

          <TabsContent value="chaos-stats">
            <p className="text-sm text-muted-foreground mb-3 italic">
              Note: random add-on stat
            </p>
            {renderRefTable(
              ["Critical", "Critical Damage", "Phy Def", "Mag Def", "Final Damage"],
              [
                [
                  EternalChaosTalismanStatTable.critical.join(" / "),
                  EternalChaosTalismanStatTable.criticalDamage.join(" / "),
                  EternalChaosTalismanStatTable.phyDef.join(" / "),
                  EternalChaosTalismanStatTable.magDef.join(" / "),
                  EternalChaosTalismanStatTable.fd.join(" / "),
                ],
              ]
            )}
          </TabsContent>

          <TabsContent value="world-mats">
            {renderRefTable(
              ["Enhancement", "Eternal Dimensional Apparition", "Gold"],
              EternalWorldTalismanMatsTable.map((r) => [
                `lv.${r.encLevel}`,
                r.apparition,
                r.gold,
              ])
            )}
          </TabsContent>

          <TabsContent value="pain-mats">
            {renderRefTable(
              ["Enhancement", "Eternal Dimensional Apparition", "Eternal Pain Vortex", "Gold"],
              EternalPainTalismanMatsTable.map((r) => [
                `lv.${r.encLevel}`,
                r.apparition,
                r.vortex,
                r.gold,
              ])
            )}
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
};

export default ExternalTalismanContent;
