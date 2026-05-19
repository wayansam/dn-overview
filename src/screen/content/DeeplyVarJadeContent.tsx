import { useMemo, useState } from "react";
import { Select, Tooltip } from "antd";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingCard, { ItemList } from "../../components/ListingCard";
import { EmptyCommonnStat } from "../../constants/Common.constants";
import {
  DeeplyVariantLJadeEnhanceMaterialTable,
  DeeplyVariantLJadeStatsTable,
  DeeplyVariantUJadeEnhanceMaterialTable,
  DeeplyVariantUJadeStatsTable,
} from "../../data/DeeplyVarJadeData";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  combineEqStats,
  getComparedData,
  getStatDif,
  getSuccessRateTag,
} from "../../utils/common.util";

const uOpts = Array.from({ length: 11 }, (_, i) => ({ label: `+${i}`, value: i }));
const lOpts = Array.from({ length: 51 }, (_, i) => ({ label: `+${i}`, value: i }));

interface MatRow {
  name: string;
  amount: number;
}

const renderRefTable = (
  headers: string[],
  rows: (string | number | undefined)[][]
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

const DeeplyVarJadeContent = () => {
  const [uFrom, setUFrom] = useState(0);
  const [uTo, setUTo] = useState(10);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [checkedEvoL, setCheckedEvoL] = useState(false);
  const [checkedEvoA, setCheckedEvoA] = useState(false);
  const [lFrom, setLFrom] = useState(0);
  const [lTo, setLTo] = useState(1);

  const lIsError = lFrom >= lTo;

  const uMats = useMemo((): MatRow[] => {
    const sliced = DeeplyVariantUJadeEnhanceMaterialTable.slice(uFrom, uTo);
    let deepFrag = 0;
    let gold = 0;
    sliced.forEach((r) => {
      deepFrag += r.deepRootedLonging;
      gold += r.gold;
    });
    if (checkedCraft) {
      deepFrag += 200;
      gold += 200000;
    }
    const rows: MatRow[] = [];
    const energy = checkedCraft ? 2 : 0;
    const will = checkedEvoL ? 1 : 0;
    const origin = checkedEvoA ? 1 : 0;
    if (energy > 0) rows.push({ name: "Collapse Dimension Energy", amount: energy });
    if (deepFrag > 0) rows.push({ name: "Deeply Rooted Fragment of Longing", amount: deepFrag });
    if (gold > 0) rows.push({ name: "Gold", amount: gold });
    if (will > 0) rows.push({ name: "Contaminated Will", amount: will });
    if (origin > 0) rows.push({ name: "Corrupted Origin", amount: origin });
    return rows;
  }, [uFrom, uTo, checkedCraft, checkedEvoL, checkedEvoA]);

  const uStatDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    const { dt1, dt2 } = getComparedData(
      DeeplyVariantUJadeStatsTable,
      uFrom + 1,
      uTo + 1
    );
    if (dt2) {
      if (checkedCraft) {
        temp = dt2;
      } else {
        const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
        temp = combineEqStats(temp, dt, "add");
      }
    }
    if (checkedEvoL || checkedEvoA) {
      temp = { ...temp, attAtkPercent: 5 };
    }
    return temp;
  }, [uFrom, uTo, checkedCraft, checkedEvoL, checkedEvoA]);

  const lMats = useMemo((): {
    rows: MatRow[];
    failEnhances: Array<{ enhance: string; sRate: string }>;
  } => {
    if (lIsError) return { rows: [], failEnhances: [] };
    const sliced = DeeplyVariantLJadeEnhanceMaterialTable.slice(lFrom, lTo);
    let deepFrag = 0;
    let twisted = 0;
    let gold = 0;
    const failEnhances: Array<{ enhance: string; sRate: string }> = [];
    sliced.forEach((r) => {
      deepFrag += r.deepRootedLonging;
      twisted += r.twistedRoot ?? 0;
      gold += r.gold;
      if (r.successRatePercent !== 100) {
        failEnhances.push({
          enhance: `${r.encLevel}`,
          sRate: `${r.successRatePercent}%`,
        });
      }
    });
    const rows: MatRow[] = [];
    if (deepFrag > 0)
      rows.push({ name: "Deeply Rooted Fragment of Longing", amount: deepFrag });
    if (twisted > 0) rows.push({ name: "Twisted Root", amount: twisted });
    if (gold > 0) rows.push({ name: "Gold", amount: gold });
    return { rows, failEnhances };
  }, [lFrom, lTo, lIsError]);

  const lStatDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (lIsError) return temp;
    const tableHolder: CommonItemStats[] = [
      { ...DeeplyVariantUJadeStatsTable[10], attAtkPercent: 5 },
      ...DeeplyVariantLJadeStatsTable,
    ];
    const { dt1, dt2 } = getComparedData(tableHolder, lFrom + 1, lTo + 1);
    if (dt2) {
      const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
      temp = combineEqStats(temp, dt, "add");
    }
    return temp;
  }, [lFrom, lTo, lIsError]);

  const lExtraInfo: ItemList[] = useMemo(() => {
    const list: ItemList[] = [];
    list.push({
      title: "Summary",
      isHeader: true,
      removeWidth: true,
      children: getSuccessRateTag("sRate", [
        lMats.failEnhances.length !== 0 ? 0 : 100,
      ]),
    });
    lMats.failEnhances.forEach((it) => {
      list.push({
        title: `Enhancing to +${it.enhance} has`,
        value: `${it.sRate} success rate`,
      });
    });
    return list;
  }, [lMats]);

  const renderMatsList = (rows: MatRow[]) => {
    if (rows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
          <Package className="h-10 w-10 opacity-30" />
          <p className="text-sm">No materials required</p>
        </div>
      );
    }
    return (
      <div className="divide-y">
        {rows.map((r) => (
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
    );
  };

  return (
    <Tabs defaultValue="calculator" className="space-y-4">
      <TabsList>
        <TabsTrigger value="calculator">Calculator</TabsTrigger>
        <TabsTrigger value="reference">Reference</TabsTrigger>
      </TabsList>

      {/* ── CALCULATOR ── */}
      <TabsContent value="calculator">
        <Tabs defaultValue="unique" className="space-y-4">
          <TabsList>
            <TabsTrigger value="unique">Unique Grade</TabsTrigger>
            <TabsTrigger value="legend">Legend / Ancient</TabsTrigger>
          </TabsList>

          {/* Unique Grade */}
          <TabsContent value="unique" className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">From</span>
                    <Select
                      value={uFrom}
                      options={uOpts}
                      onChange={setUFrom}
                      style={{ width: 80 }}
                      size="small"
                    />
                    <span className="text-sm text-muted-foreground">To</span>
                    <Select
                      value={uTo}
                      options={uOpts}
                      onChange={setUTo}
                      style={{ width: 80 }}
                      size="small"
                    />
                  </div>

                  <div className="w-px h-5 bg-border hidden sm:block" />

                  <Tooltip
                    title="200 deep fragment longing, 2 collapse Dim. Energy, 200,000 Gold"
                    color="blue"
                    placement="bottom"
                  >
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox
                        checked={checkedCraft}
                        onCheckedChange={(v) => setCheckedCraft(Boolean(v))}
                      />
                      <span className="text-sm">Include craft mats</span>
                    </label>
                  </Tooltip>

                  <Tooltip
                    title="1 Contaminated Will"
                    color="blue"
                    placement="bottom"
                  >
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox
                        checked={checkedEvoL}
                        onCheckedChange={(v) => setCheckedEvoL(Boolean(v))}
                      />
                      <span className="text-sm">Include Legend evolver</span>
                    </label>
                  </Tooltip>

                  <Tooltip
                    title="1 Corrupted Origin"
                    color="blue"
                    placement="bottom"
                  >
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox
                        checked={checkedEvoA}
                        onCheckedChange={(v) => setCheckedEvoA(Boolean(v))}
                      />
                      <span className="text-sm">Include Ancient evolver</span>
                    </label>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Required Materials</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-2">
                  {renderMatsList(uMats)}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4">
                <ListingCard title="Status Increase" data={getStatDif(uStatDif)} />
                {checkedEvoL && (
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        *1 Skill ATK up Add on Stats [cm3 / ult / 50 spec /
                        secondary / main] +50%
                      </p>
                    </CardContent>
                  </Card>
                )}
                {checkedEvoA && (
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        *3 Critical hit additional damage Add on Stats [cm3 /
                        ult / 50 spec / secondary / main] from [all class] with
                        [1/3/5/7/10]%
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Legend / Ancient Grade */}
          <TabsContent value="legend" className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">From</span>
                    <Select
                      value={lFrom}
                      options={lOpts}
                      onChange={setLFrom}
                      style={{ width: 80 }}
                      size="small"
                      status={lIsError ? "error" : undefined}
                    />
                    <span className="text-sm text-muted-foreground">To</span>
                    <Select
                      value={lTo}
                      options={lOpts}
                      onChange={setLTo}
                      style={{ width: 80 }}
                      size="small"
                      status={lIsError ? "error" : undefined}
                    />
                  </div>
                  {lIsError && (
                    <span className="text-sm text-destructive">
                      From must be less than To
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Required Materials</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-2">
                  {renderMatsList(lMats.rows)}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4">
                <ListingCard
                  keyId="l-extra-info"
                  title="Extra Info"
                  data={lExtraInfo}
                />
                <ListingCard title="Status Increase" data={getStatDif(lStatDif)} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* ── REFERENCE ── */}
      <TabsContent value="reference">
        <Tabs defaultValue="u-mats" className="space-y-4">
          <TabsList>
            <TabsTrigger value="u-mats">U Grade Mats</TabsTrigger>
            <TabsTrigger value="u-stats">U Grade Stats</TabsTrigger>
            <TabsTrigger value="l-mats">L/A Mats</TabsTrigger>
            <TabsTrigger value="l-stats">L/A Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="u-mats">
            {renderRefTable(
              ["Enhancement", "Deep Fragment of Longing", "Gold"],
              DeeplyVariantUJadeEnhanceMaterialTable.map((r) => [
                `+${r.encLevel}`,
                r.deepRootedLonging,
                r.gold,
              ])
            )}
          </TabsContent>

          <TabsContent value="u-stats">
            {renderRefTable(
              ["Enhancement", "ATK", "CDM", "FD", "HP"],
              DeeplyVariantUJadeStatsTable.map((r) => [
                `+${r.encLevel}`,
                r.phyMagAtk,
                r.cdm,
                r.fd,
                r.hp,
              ])
            )}
          </TabsContent>

          <TabsContent value="l-mats">
            {renderRefTable(
              [
                "Enhancement",
                "Deep Fragment of Longing",
                "Twisted Root",
                "Gold",
                "Success Rate",
              ],
              DeeplyVariantLJadeEnhanceMaterialTable.map((r) => [
                `+${r.encLevel}`,
                r.deepRootedLonging,
                r.twistedRoot,
                r.gold,
                r.successRatePercent !== undefined
                  ? `${r.successRatePercent}%`
                  : "-",
              ])
            )}
          </TabsContent>

          <TabsContent value="l-stats">
            {renderRefTable(
              ["Enhancement", "ATK", "Att ATK%", "CDM", "FD", "HP"],
              DeeplyVariantLJadeStatsTable.map((r) => [
                `+${r.encLevel}`,
                r.phyMagAtk,
                r.attAtkPercent !== undefined ? `${r.attAtkPercent}%` : "-",
                r.cdm,
                r.fd,
                r.hp,
              ])
            )}
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
};

export default DeeplyVarJadeContent;
