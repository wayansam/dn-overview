import { InputNumber, Select } from "antd";
import { Package } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TradingHouseCalc, {
  CalcDataMapped,
} from "../../components/TradingHouseCalc";
import {
  AncientGoddesHeraDisassemblyItemTable,
  AncientGoddesHeraRequiredItemTable,
  AncientGoddesHeraStatTable,
} from "../../data/AncientsGoddessHeraData";

const enhOpts = Array.from({ length: 11 }, (_, i) => ({
  label: `+${i}`,
  value: i,
}));

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

const AncientHeraldryContent = () => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(10);
  const [convertToFrag, setConvertToFrag] = useState(false);
  const [invenAB, setInvenAB] = useState(0);
  const [invenABF, setInvenABF] = useState(0);
  const [dt, setDt] = useState<CalcDataMapped[]>([]);

  const isError = from >= to;

  const mats = useMemo(() => {
    if (isError) return { abFrag: 0, ab: 0, gold: 0 };
    const fromMats = AncientGoddesHeraRequiredItemTable[from];
    const toMats = AncientGoddesHeraRequiredItemTable[to];
    let tempABF = toMats.abFrag - fromMats.abFrag;
    let tempAB = toMats.ab - fromMats.ab;
    let tempGold = 0;

    if (to > 5 && from < 6) {
      tempAB += tempABF / 10;
      tempABF = 0;
      tempGold = (fromMats.abFrag / 10) * 500;
    }
    if (convertToFrag) {
      tempABF += tempAB * 10;
      tempAB = 0;
      tempGold = toMats.ab * 500;
    }
    return { abFrag: tempABF, ab: tempAB, gold: tempGold };
  }, [from, to, isError, convertToFrag]);

  const matRows = [
    { name: "Ancients' Blueprint Fragment", amount: mats.abFrag },
    { name: "Ancients' Blueprint", amount: mats.ab },
    { name: "Gold", amount: mats.gold },
  ].filter((r) => r.amount > 0);

  const statGain = useMemo(() => {
    if (isError) return 0;
    return (
      AncientGoddesHeraStatTable[to].attackPercent -
      AncientGoddesHeraStatTable[from].attackPercent
    );
  }, [from, to, isError]);

  const progressData = useMemo(() => {
    const fromMats = AncientGoddesHeraRequiredItemTable[from];
    const toMats = AncientGoddesHeraRequiredItemTable[to];
    if (toMats.encLevel <= 5) {
      return [{ name: "Blueprint Frag", amt: fromMats.abFrag, useCustomAmt: true }];
    }
    return [
      { name: "Blueprint", amt: fromMats.ab, useCustomAmt: true },
      { name: "Blueprint Frag", amt: fromMats.abFrag, useCustomAmt: true },
    ];
  }, [from, to]);

  const progressInfo = useMemo(() => {
    const fromMats = AncientGoddesHeraRequiredItemTable[from];
    const toMats = AncientGoddesHeraRequiredItemTable[to];
    let converterGold = 0;
    let matsPercent = 0;
    let msgTotal = "";
    let tempTotalAB = invenAB;

    const convertABFtoAB = (abFrag: number) => {
      const ab = Math.trunc(abFrag / 10);
      tempTotalAB += ab;
      converterGold += ab * 500;
    };

    const foundAB = dt.find((it) => it.name === "Blueprint");
    const foundABF = dt.find((it) => it.name === "Blueprint Frag");

    if (toMats.encLevel > 5) {
      if (fromMats.encLevel <= 5) {
        convertABFtoAB(fromMats.abFrag);
      } else {
        convertABFtoAB(fromMats.ab * 10);
      }
      convertABFtoAB(invenABF);
      if (foundABF) convertABFtoAB(foundABF.customAmt);
      if (foundAB) {
        const a = Math.trunc(((tempTotalAB + foundAB.customAmt) * 100) / toMats.ab);
        msgTotal = `AB Collected: ${tempTotalAB + foundAB.customAmt} / ${toMats.ab}`;
        matsPercent = Math.min(a, 100);
      }
    } else if (toMats.encLevel <= 5) {
      if (foundABF) {
        const total = fromMats.abFrag + foundABF.customAmt + invenABF;
        const a = Math.trunc((total * 100) / toMats.abFrag);
        msgTotal = `ABF Collected: ${total} / ${toMats.abFrag}`;
        matsPercent = Math.min(a, 100);
      }
    }

    return { converterGold, matsPercent, msgTotal, fromMats };
  }, [dt, from, to, invenAB, invenABF]);

  const additionalHeaderItem = (
    <div className="space-y-2 text-sm">
      {progressInfo.msgTotal && (
        <p className="text-muted-foreground">{progressInfo.msgTotal}</p>
      )}
      {progressInfo.fromMats.ab !== 0 && (
        <p className="text-muted-foreground">AB Recovered: {progressInfo.fromMats.ab.toLocaleString()}</p>
      )}
      {progressInfo.fromMats.abFrag !== 0 && (
        <p className="text-muted-foreground">ABF Recovered: {progressInfo.fromMats.abFrag.toLocaleString()}</p>
      )}
      {progressInfo.converterGold !== 0 && (
        <p className="text-muted-foreground">
          Gold to convert ABF→AB: {progressInfo.converterGold.toLocaleString()}
        </p>
      )}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">AB in inventory</span>
        <InputNumber
          min={0}
          value={invenAB}
          onChange={(v) => setInvenAB(v ?? 0)}
          size="small"
          style={{ width: 100 }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">ABF in inventory</span>
        <InputNumber
          min={0}
          value={invenABF}
          onChange={(v) => setInvenABF(v ?? 0)}
          size="small"
          style={{ width: 100 }}
        />
      </div>
      <p className="text-muted-foreground">Buy in TH:</p>
    </div>
  );

  return (
    <Tabs defaultValue="calculator" className="space-y-4">
      <TabsList>
        <TabsTrigger value="calculator">Calculator</TabsTrigger>
        <TabsTrigger value="reference">Reference</TabsTrigger>
      </TabsList>

      {/* ── CALCULATOR ── */}
      <TabsContent value="calculator" className="space-y-4">
        {/* Settings bar */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">From</span>
                <Select
                  value={from}
                  options={enhOpts}
                  onChange={setFrom}
                  style={{ width: 80 }}
                  size="small"
                  status={isError ? "error" : undefined}
                />
                <span className="text-sm text-muted-foreground">To</span>
                <Select
                  value={to}
                  options={enhOpts}
                  onChange={setTo}
                  style={{ width: 80 }}
                  size="small"
                  status={isError ? "error" : undefined}
                />
              </div>
              {isError && (
                <span className="text-sm text-destructive">
                  From must be less than To
                </span>
              )}

              <div className="w-px h-5 bg-border hidden sm:block" />

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={convertToFrag}
                  onCheckedChange={(v: boolean | "indeterminate") => setConvertToFrag(Boolean(v))}
                />
                <span className="text-sm">Convert Blueprint to Fragment</span>
              </label>
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
              {isError || matRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                  <Package className="h-10 w-10 opacity-30" />
                  <p className="text-sm">
                    {isError ? "Fix the range above" : "No materials required"}
                  </p>
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

          {/* Right: Stats + My Progress */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Status Increase</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm">Hero Skill ATK</span>
                  <span className="text-sm font-medium tabular-nums">
                    +{statGain}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <TradingHouseCalc
              customTitle="My Progress"
              data={progressData}
              additionalTotal={progressInfo.converterGold}
              showProgress
              disableFilter
              progressPercent={progressInfo.matsPercent}
              copyFn={setDt}
              additionalHeaderItem={additionalHeaderItem}
            />
          </div>
        </div>
      </TabsContent>

      {/* ── REFERENCE ── */}
      <TabsContent value="reference">
        <Tabs defaultValue="required" className="space-y-4">
          <TabsList>
            <TabsTrigger value="required">Required Items</TabsTrigger>
            <TabsTrigger value="disassembly">Disassembly</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="required">
            {renderRefTable(
              ["Enhancement", "Ancients' Blueprint", "Ancients' Blueprint Fragment"],
              AncientGoddesHeraRequiredItemTable.map((r) => [
                `+${r.encLevel}`,
                r.ab || "-",
                r.abFrag || "-",
              ])
            )}
          </TabsContent>

          <TabsContent value="disassembly">
            {renderRefTable(
              ["Enhancement", "Ancients' Blueprint Fragment"],
              AncientGoddesHeraDisassemblyItemTable.map((r) => [
                `+${r.encLevel}`,
                r.abFrag,
              ])
            )}
          </TabsContent>

          <TabsContent value="stats">
            {renderRefTable(
              ["Enhancement", "Hero Skill ATK"],
              AncientGoddesHeraStatTable.map((r) => [
                `+${r.encLevel}`,
                `${r.attackPercent}%`,
              ])
            )}
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
};

export default AncientHeraldryContent;
