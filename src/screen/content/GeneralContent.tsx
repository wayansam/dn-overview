import { ArrowRight, Sparkles, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../../components/ui/card";
import { TAB_KEY } from "../../constants/Common.constants";
import { useAppDispatch } from "../../hooks";
import { SideBarTab } from "../../interface/Common.interface";
import { setSelectedSideBar } from "../../slice/UIState.reducer";
import { LS_KEYS } from "../../constants/localStorage.constants";

type UpdateType = "New" | "Update" | "Planned";

interface FeatureItem {
  type: UpdateType;
  label: string;
  link?: SideBarTab;
  date?: string;
}

const dataNew: FeatureItem[] = [
  {
    type: "New",
    label: "Collapsible sidebar — collapse to icon-only rail; hover any icon to see its submenu",
    date: "19-05-2026",
  },
  {
    type: "Update",
    label: "All calculators redesigned with a consistent modern interface",
    date: "19-05-2026",
  },
  {
    type: "Update",
    label: "Conversion — equipment selection redesigned with grouped card layout",
    link: { key: TAB_KEY.miscConversion, name: TAB_KEY.miscConversion },
    date: "19-05-2026",
  },
];

const dataPlanned: FeatureItem[] = [
  { type: "Planned", label: "To Do List" },
  { type: "Planned", label: "Future feature (beta)" },
  { type: "Planned", label: "Gear Info" },
];

const TYPE_CONFIG: Record<UpdateType, { label: string; className: string }> = {
  New: {
    label: "New",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  Update: {
    label: "Update",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  },
  Planned: {
    label: "Planned",
    className:
      "bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400",
  },
};

const GeneralContent = () => {
  const dispatch = useAppDispatch();

  const navigate = (tab: SideBarTab) => {
    dispatch(setSelectedSideBar(tab));
    localStorage.setItem(LS_KEYS.last_screen, JSON.stringify(tab));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-8">

      {/* Hero */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
          <Swords size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground leading-snug">
            DN Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Enhancement rate &amp; drop calculator for Dragon Nest SEA
          </p>
        </div>
      </div>

      {/* What's New */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              What's New
            </h2>
          </div>
          <button
            onClick={() => navigate({ key: TAB_KEY.releaseHistory, name: TAB_KEY.releaseHistory })}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            See all
            <ArrowRight size={11} />
          </button>
        </div>

        <div className="space-y-2">
          {dataNew.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type];
            return (
              <Card key={i} size="sm">
                <CardContent className="flex items-start justify-between gap-3 py-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={cn(
                        "shrink-0 mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                        cfg.className
                      )}
                    >
                      {cfg.label}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        {item.label}
                      </p>
                      {item.date && (
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                          {item.date}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.link && (
                    <button
                      onClick={() => navigate(item.link!)}
                      className="shrink-0 flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                    >
                      Open
                      <ArrowRight size={12} />
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* What's Next */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide text-muted-foreground/70">
          What's Next
        </h2>
        <div className="space-y-1.5">
          {dataPlanned.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
              {item.label}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default GeneralContent;
