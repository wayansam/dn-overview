import { Checkbox, Select, Slider } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { SliderMarks } from "antd/es/slider";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  NamedEODMainStatTable,
  NamedEODMaterialTable,
  NamedEODSecondStatTable,
} from "../../data/NamedEODData";
import { NamedEODStat } from "../../interface/ItemStat.interface";

const sliderStyle: React.CSSProperties = {
  display: "inline-block",
  height: 300,
  marginLeft: 20,
  marginRight: 50,
  marginTop: 10,
  marginBottom: 30,
};

const marks: SliderMarks = {
  0: "+0", 1: "+1", 2: "+2", 3: "+3", 4: "+4", 5: "+5",
  6: "+6", 7: "+7", 8: "+8", 9: "+9", 10: "+10",
};

interface NamedEODTableMaterialList {
  "Guide Star": number;
  "Twilight Essence": number;
  Gold: number;
}

const NamedEODEqContent = () => {
  const [namedEODData, setNamedEODData] = useState([0, 5]);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [selectedStat, setSelectedStat] = useState(0);

  const ancDataSource: NamedEODTableMaterialList = useMemo(() => {
    const tempSlice = NamedEODMaterialTable.slice(namedEODData[0], namedEODData[1]);
    let gs = 0, ess = 0, gold = 0;
    tempSlice.forEach((s) => { gs += s.guideStar; ess += s.twilightEssence; gold += s.gold; });
    if (checkedCraft) { gs += 10; ess += 80; gold += 25; }
    return { "Guide Star": gs, "Twilight Essence": ess, Gold: gold };
  }, [namedEODData, checkedCraft]);

  const getStatDiff = (arr: NamedEODStat[], min: number, max: number) => {
    const dt1 = arr[min];
    const dt2 = arr[max];
    if (!dt1 || !dt2) return { encLevel: 0, minAttack: 0, maxAttack: 0, attackPercent: 0, critical: 0, criticalDamage: 0 };
    return {
      encLevel: 0,
      minAttack: dt2.minAttack - dt1.minAttack,
      maxAttack: dt2.maxAttack - dt1.maxAttack,
      attackPercent: dt2.attackPercent - dt1.attackPercent,
      critical: dt2.critical - dt1.critical,
      criticalDamage: dt2.criticalDamage - dt1.criticalDamage,
    };
  };

  const statRange = useMemo(() => {
    if (selectedStat === 1) return getStatDiff(NamedEODMainStatTable, namedEODData[0], namedEODData[1]);
    if (selectedStat === 2) return getStatDiff(NamedEODSecondStatTable, namedEODData[0], namedEODData[1]);
    return undefined;
  }, [selectedStat, namedEODData]);

  const matEntries = Object.entries(ancDataSource) as [string, number][];


  return (
    <Tabs defaultValue="calc" className="space-y-4 pb-8">
      <TabsList>
        <TabsTrigger value="calc">Calculator</TabsTrigger>
        <TabsTrigger value="ref">Reference Tables</TabsTrigger>
      </TabsList>

      {/* ── Calculator ── */}
      <TabsContent value="calc">
        <div className="flex flex-wrap gap-6 items-start">

          {/* Slider */}
          <div style={sliderStyle}>
            <Slider vertical range marks={marks} defaultValue={[0, 5]} max={10} min={0}
              onChangeComplete={(v) => setNamedEODData(v as number[])} />
          </div>

          {/* Settings + Results */}
          <div className="space-y-4 min-w-[220px]">
            <Card size="sm">
              <CardHeader className="border-b pb-2">
                <CardTitle className="text-sm">Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox checked={checkedCraft} onChange={(e: CheckboxChangeEvent) => setCheckedCraft(e.target.checked)}>
                    <span className="text-sm">Include Craft Mats</span>
                  </Checkbox>
                </div>
                <p className="text-xs text-muted-foreground">Craft: 10 Guide Star, 80 Twilight Essence, 25 Gold</p>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="border-b pb-2">
                <CardTitle className="text-sm">Materials</CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-1.5">
                {matEntries.map(([name, amount]) => (
                  <div key={name} className="flex items-center justify-between text-sm gap-4">
                    <span className="text-foreground/80">{name}</span>
                    <span className="font-medium tabular-nums shrink-0">{amount.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader className="border-b pb-2">
                <CardTitle className="text-sm">Stat Increase</CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-3">
                <Select value={selectedStat} style={{ width: "100%" }} onChange={setSelectedStat}
                  options={[{ value: 0, label: "Select weapon type" }, { value: 1, label: "Main Weapon" }, { value: 2, label: "Second Weapon" }]}
                  size="small" />
                {statRange && (
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">ATK</span><span className="font-medium">+{statRange.minAttack}–{statRange.maxAttack}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">ATK %</span><span className="font-medium">+{statRange.attackPercent}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Critical</span><span className="font-medium">+{statRange.critical}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Crit Damage</span><span className="font-medium">+{statRange.criticalDamage}</span></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* ── Reference ── */}
      <TabsContent value="ref" className="space-y-4">
        {/* Enhancement Materials */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b py-3 px-4 bg-muted/30">
            <CardTitle className="text-sm">Enhancement Materials</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-xs border-b border-border">
                    <th className="text-left px-4 py-2.5 font-semibold tracking-wide">Level</th>
                    <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Guide Star</th>
                    <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Twilight Essence</th>
                    <th className="text-right px-4 py-2.5 font-semibold tracking-wide">Gold</th>
                  </tr>
                </thead>
                <tbody>
                  {NamedEODMaterialTable.map((row, idx) => (
                    <tr key={row.encLevel} className={cn("border-b border-border/40 transition-colors hover:bg-muted/50", idx % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                      <td className="px-4 py-1.5">
                        <span className="inline-flex h-5 min-w-[2rem] items-center justify-center rounded px-1.5 font-mono text-[11px] font-bold ring-1 ring-inset bg-muted text-foreground ring-border">+{row.encLevel}</span>
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.guideStar.toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.twilightEssence.toLocaleString()}</td>
                      <td className="px-4 py-1.5 text-right font-mono text-xs tabular-nums font-semibold text-amber-600 dark:text-amber-400">{row.gold.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Weapon Stat Tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { label: "Main Weapon", data: NamedEODMainStatTable },
            { label: "Second Weapon", data: NamedEODSecondStatTable },
          ] as { label: string; data: NamedEODStat[] }[]).map(({ label, data }) => (
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
                        <th className="text-right px-3 py-2.5 font-semibold tracking-wide">ATK Range</th>
                        <th className="text-right px-3 py-2.5 font-semibold tracking-wide">ATK %</th>
                        <th className="text-right px-3 py-2.5 font-semibold tracking-wide">Critical</th>
                        <th className="text-right px-4 py-2.5 font-semibold tracking-wide">Crit Dmg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, idx) => (
                        <tr key={row.encLevel} className={cn("border-b border-border/40 transition-colors hover:bg-muted/50", idx % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                          <td className="px-4 py-1.5">
                            <span className="inline-flex h-5 min-w-[2rem] items-center justify-center rounded px-1.5 font-mono text-[11px] font-bold ring-1 ring-inset bg-muted text-foreground ring-border">+{row.encLevel}</span>
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.minAttack.toLocaleString()}–{row.maxAttack.toLocaleString()}</td>
                          <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.attackPercent}%</td>
                          <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/75">{row.critical.toLocaleString()}</td>
                          <td className="px-4 py-1.5 text-right font-mono text-xs tabular-nums font-semibold text-amber-600 dark:text-amber-400">{row.criticalDamage.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default NamedEODEqContent;
