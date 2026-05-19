import { Select, Tooltip } from "antd";
import { Package } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErosionConquerorJadeMaterialTable } from "../../data/ErosionData";

const enhOpts = Array.from({ length: 21 }, (_, i) => ({
  label: `+${i}`,
  value: i,
}));

const renderRefTable = (headers: string[], rows: (string | number)[][]) => (
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
                {typeof cell === "number" ? cell.toLocaleString() : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ErosionJadeContent = () => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(10);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [checkedTier, setCheckedTier] = useState(false);

  const isError = from >= to;

  const mats = useMemo(() => {
    if (isError) return { erosionFragment: 0, goldLotusCrown: 0, gold: 0 };
    const sliced = ErosionConquerorJadeMaterialTable.slice(from, to);
    let erosionFragment = 0, goldLotusCrown = 0, gold = 0;
    sliced.forEach((r) => {
      erosionFragment += r.erosionFragment;
      goldLotusCrown += r.goldLotusCrown;
      gold += r.gold;
    });
    if (checkedCraft) {
      erosionFragment += 10;
      gold += 10000;
    }
    if (checkedTier) {
      erosionFragment += 100;
      gold += 10000;
    }
    return { erosionFragment, goldLotusCrown, gold };
  }, [from, to, isError, checkedCraft, checkedTier]);

  const matRows = [
    { name: "Erosion Fragment", amount: mats.erosionFragment },
    { name: "Gold Lotus Crown", amount: mats.goldLotusCrown },
    { name: "Gold", amount: mats.gold },
  ].filter((r) => r.amount > 0);

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

              <Tooltip
                title="10 Erosion Fragment + 10,000 Gold"
                color="blue"
                placement="bottom"
              >
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={checkedCraft}
                    onCheckedChange={(v) => setCheckedCraft(Boolean(v))}
                  />
                  <span className="text-sm">Include 1st shop mats</span>
                </label>
              </Tooltip>

              <Tooltip
                title="+20 Tier 1 required, 100 Erosion Fragment + 10,000 Gold"
                color="blue"
                placement="bottom"
              >
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    checked={checkedTier}
                    onCheckedChange={(v) => setCheckedTier(Boolean(v))}
                  />
                  <span className="text-sm">Include Tier 2 evolve</span>
                </label>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Materials card */}
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
      </TabsContent>

      {/* ── REFERENCE ── */}
      <TabsContent value="reference">
        {renderRefTable(
          ["Enhancement", "Erosion Fragment", "Gold Lotus Crown", "Gold"],
          ErosionConquerorJadeMaterialTable.map((r) => [
            `+${r.encLevel}`,
            r.erosionFragment,
            r.goldLotusCrown,
            r.gold,
          ])
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ErosionJadeContent;
