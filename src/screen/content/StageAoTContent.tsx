import { ChevronLeft, ChevronRight, Coins, Info, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  aotRewardS2FutureInit,
  aotRewardS2FutureWeek,
  aotRewardS3PastInit,
  aotRewardS3PastWeek,
} from "../../data/StageAoTData";
import { StageAotReward } from "../../interface/reward.interface";

const floorPref = {
  first: "First",
  coins: "Coins",
  shinyCoins: "Shiny Coins",
  last: "Last",
} as const;

const seasonKey = {
  s3Past: "Season 3 [Past]",
  s2Future: "Season 2 [Future]",
} as const;

type Season = (typeof seasonKey)[keyof typeof seasonKey];
type Pref = (typeof floorPref)[keyof typeof floorPref];

const StageAoTContent = () => {
  const [selectSeason, setSelectSeason] = useState<Season>(seasonKey.s3Past);
  const [selectedPref, setSelectedPref] = useState<Pref>(floorPref.first);
  const [selectFloor, setSelectFloor] = useState<number>(1);

  const seasonData = useMemo((): {
    first: StageAotReward[];
    weekly: StageAotReward[];
  } => {
    switch (selectSeason) {
      case seasonKey.s2Future:
        return { first: aotRewardS2FutureInit, weekly: aotRewardS2FutureWeek };
      case seasonKey.s3Past:
        return { first: aotRewardS3PastInit, weekly: aotRewardS3PastWeek };
      default:
        return { first: [], weekly: [] };
    }
  }, [selectSeason]);

  const foundC = useMemo(
    () => seasonData.weekly.find((item) => item.rewards["Hero Coins"] !== undefined),
    [seasonData.weekly]
  );

  const foundSC = useMemo(
    () => seasonData.weekly.find((item) => item.rewards["Shiny Hero Coins"] !== undefined),
    [seasonData.weekly]
  );

  const totalFloors = seasonData.first.length;

  useEffect(() => {
    if (totalFloors < 1) { setSelectFloor(1); return; }
    switch (selectedPref) {
      case floorPref.first:       setSelectFloor(1); break;
      case floorPref.coins:       setSelectFloor(foundC?.floor ?? 1); break;
      case floorPref.shinyCoins:  setSelectFloor(foundSC?.floor ?? 1); break;
      case floorPref.last:        setSelectFloor(totalFloors); break;
    }
  }, [selectedPref, totalFloors, foundC, foundSC]);

  const selectedSeasonData = useMemo(() => ({
    first:  seasonData.first.find((it) => it.floor === selectFloor),
    weekly: seasonData.weekly.find((it) => it.floor === selectFloor),
  }), [seasonData, selectFloor]);

  const titleList = useMemo(
    () => seasonData.first.filter((it) => it.title),
    [seasonData.first]
  );

  const rewardEntries = (r?: StageAotReward) =>
    Object.entries(r?.rewards ?? {}).filter(
      ([, v]) => typeof v === "number" && v !== 0
    ) as [string, number][];

  return (
    <div className="space-y-6 max-w-3xl pb-8">

      {/* Season selector */}
      <div className="flex gap-2">
        {Object.values(seasonKey).map((s) => (
          <button
            key={s}
            onClick={() => setSelectSeason(s as Season)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer",
              selectSeason === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Floor navigation */}
      <Card size="sm">
        <CardContent className="pt-3 pb-3 space-y-3">

          {/* Preference shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground w-20 shrink-0">Jump to</span>
            <div className="flex gap-1.5 flex-wrap">
              {Object.values(floorPref).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPref(p as Pref)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    selectedPref === p
                      ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Floor stepper */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20 shrink-0">Floor</span>
            <button
              onClick={() => setSelectFloor((f) => Math.max(1, f - 1))}
              disabled={selectFloor <= 1}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <select
              value={selectFloor}
              onChange={(e) => setSelectFloor(Number(e.target.value))}
              className="h-7 px-2 rounded-md bg-muted text-sm text-foreground border-0 outline-none cursor-pointer"
            >
              {Array.from({ length: totalFloors }, (_, i) => i + 1).map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <button
              onClick={() => setSelectFloor((f) => Math.min(totalFloors, f + 1))}
              disabled={selectFloor >= totalFloors}
              className="flex items-center justify-center w-7 h-7 rounded-md bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
            <span className="text-xs text-muted-foreground">of {totalFloors}</span>

            {selectedSeasonData.first?.title && (
              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                {selectedSeasonData.first.title}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rewards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RewardCard
          title="First Clear"
          entries={rewardEntries(selectedSeasonData.first)}
        />
        <RewardCard
          title="Weekly Clear"
          entries={rewardEntries(selectedSeasonData.weekly)}
        />
      </div>

      {/* General info */}
      <Card size="sm">
        <CardHeader className="border-b pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Info size={14} className="text-muted-foreground" />
            General Info
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-1.5">
          <InfoRow label="First floor with Hero Coins" value={foundC?.floor ?? "—"} />
          <InfoRow label="First floor with Shiny Hero Coins" value={foundSC?.floor ?? "—"} />
        </CardContent>
      </Card>

      {/* Title rewards */}
      {titleList.length > 0 && (
        <Card size="sm">
          <CardHeader className="border-b pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy size={14} className="text-muted-foreground" />
              First Clear Titles
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-1.5">
            {titleList.map((it) => (
              <div key={it.floor} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Floor {it.floor}
                </span>
                <span className="text-foreground/80">{it.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const RewardCard = ({
  title,
  entries,
}: {
  title: string;
  entries: [string, number][];
}) => (
  <Card size="sm">
    <CardHeader className="border-b pb-2">
      <CardTitle className="flex items-center gap-2 text-sm">
        <Coins size={14} className="text-muted-foreground" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-3">
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No rewards</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map(([name, amount]) => (
            <div key={name} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-foreground/80 min-w-0">{name}</span>
              <span className="shrink-0 font-medium tabular-nums text-foreground">
                ×{amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default StageAoTContent;
