import { Select } from "antd";
import { AlertTriangle, Package } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillJadeEnhanceMaterial } from "../interface/Item.interface";
import { SkillJadeStat } from "../interface/ItemStat.interface";
import TradingHouseCalc from "./TradingHouseCalc";

const enhOpts = Array.from({ length: 16 }, (_, i) => ({
  label: `+${i}`,
  value: i,
}));

const getStatDiff = (arr: SkillJadeStat[], min: number, max: number) => {
  const dt1 = arr.length > min ? arr[min] : undefined;
  const dt2 = arr.length > max ? arr[max] : undefined;
  if (!dt1 || !dt2) return { attackPercent: 0, cooldownPercent: 0 };
  return {
    attackPercent: dt2.attackPercent - dt1.attackPercent,
    cooldownPercent: dt2.cooldownPercent - dt1.cooldownPercent,
  };
};

const getSuccessRates = (
  arr: SkillJadeStat[],
  min: number,
  max: number
): Array<{ level: number; rate: number }> => {
  const result: Array<{ level: number; rate: number }> = [];
  for (let i = Math.max(min + 1, 11); i <= max; i++) {
    if (arr[i]) result.push({ level: i, rate: arr[i].successRate });
  }
  return result;
};

interface SkillJadeCalcCompProps {
  matsTable: SkillJadeEnhanceMaterial[];
  statsTable: SkillJadeStat[];
  lFragName: string;
  hFragName: string;
  hideCD?: boolean;
  hideTH?: boolean;
}

const SkillJadeCalcComp = ({
  matsTable,
  statsTable,
  lFragName,
  hFragName,
  hideCD,
  hideTH,
}: SkillJadeCalcCompProps) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(10);

  const isError = from >= to;
  const showWarning = to > 10;

  const mats = useMemo(() => {
    if (isError) return { lFrag: 0, hFrag: 0, gold: 0 };
    const sliced = matsTable.slice(from, to);
    let lFrag = 0, hFrag = 0, gold = 0;
    sliced.forEach((r) => {
      lFrag += r.lowerFragment;
      hFrag += r.higherFragment;
      gold += r.gold;
    });
    return { lFrag, hFrag, gold };
  }, [matsTable, from, to, isError]);

  const statDiff = useMemo(
    () => getStatDiff(statsTable, from, to),
    [statsTable, from, to]
  );

  const successRates = useMemo(
    () => getSuccessRates(statsTable, from, to),
    [statsTable, from, to]
  );

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
            {showWarning && !isError && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  From +11 onward, enhancement may fail
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Required Materials */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Required Materials</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {isError || (mats.lFrag === 0 && mats.hFrag === 0 && mats.gold === 0) ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                <Package className="h-10 w-10 opacity-30" />
                <p className="text-sm">
                  {isError ? "Fix the range above" : "No materials required"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {mats.lFrag > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                    <span className="text-sm">{lFragName}</span>
                    <span className="text-sm font-medium tabular-nums">
                      {mats.lFrag.toLocaleString()}
                    </span>
                  </div>
                )}
                {mats.hFrag > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                    <span className="text-sm">{hFragName}</span>
                    <span className="text-sm font-medium tabular-nums">
                      {mats.hFrag.toLocaleString()}
                    </span>
                  </div>
                )}
                {mats.gold > 0 && (
                  <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 transition-colors">
                    <span className="text-sm">Gold</span>
                    <span className="text-sm font-medium tabular-nums">
                      {mats.gold.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Stats + success rates + trading house */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status Increase</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              <div className="divide-y">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm">ATK</span>
                  <span className="text-sm font-medium tabular-nums">
                    +{statDiff.attackPercent}%
                  </span>
                </div>
                {!hideCD && (
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm">Cooldown Decrease</span>
                    <span className="text-sm font-medium tabular-nums">
                      -{statDiff.cooldownPercent}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {successRates.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-amber-600">
                  Success Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                <div className="divide-y">
                  {successRates.map(({ level, rate }) => (
                    <div
                      key={level}
                      className="flex items-center justify-between px-4 py-2 hover:bg-muted/50"
                    >
                      <span className="text-sm">Enhancing to +{level}</span>
                      <span className="text-sm font-medium tabular-nums text-amber-600">
                        {rate}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!hideTH && (
            <TradingHouseCalc
              data={[
                { name: lFragName, amt: mats.lFrag },
                { name: hFragName, amt: mats.hFrag, useCustomAmt: true },
              ]}
              additionalTotal={mats.gold}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillJadeCalcComp;
