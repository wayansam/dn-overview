import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TAB_KEY } from "../../constants/Common.constants";
import { useAppDispatch } from "../../hooks";
import { SideBarTab } from "../../interface/Common.interface";
import { setSelectedSideBar } from "../../slice/UIState.reducer";

interface FeatureItem {
  tag: "New" | "Update" | "Done" | "Planned" | "In Progress";
  label: string;
  link?: SideBarTab;
  date?: string;
}

const TAG_VARIANT: Record<FeatureItem["tag"], "default" | "secondary" | "destructive" | "outline"> = {
  New: "default",
  Update: "secondary",
  Done: "outline",
  Planned: "outline",
  "In Progress": "destructive",
};

const dataNew: FeatureItem[] = [
  {
    tag: "New",
    label: "Collapsible sidebar — collapse to icon-only rail; hover any icon to see its submenu",
    date: "19-05-2026",
  },
  {
    tag: "Update",
    label: "All calculators redesigned with a consistent modern interface",
    date: "19-05-2026",
  },
  {
    tag: "Update",
    label: "Home screen with quick-nav cards for all calculators",
    link: { key: TAB_KEY.mainGeneral, name: TAB_KEY.mainGeneral },
    date: "19-05-2026",
  },
  {
    tag: "Update",
    label: "Conversion — equipment selection redesigned with grouped card layout",
    link: { key: TAB_KEY.miscConversion, name: TAB_KEY.miscConversion },
    date: "19-05-2026",
  },
  {
    tag: "Update",
    label: "Bestie Spirit & Mount — cleaner multi-entry calculator layout",
    link: { key: TAB_KEY.miscBestie, name: TAB_KEY.miscBestie },
    date: "19-05-2026",
  },
];

const dataSoon: FeatureItem[] = [
  { tag: "Planned", label: "To Do List" },
  { tag: "Planned", label: "Future feature (beta)" },
  { tag: "Planned", label: "Gear Info" },
];

const dataPastFunc: FeatureItem[] = [
  {
    tag: "Done",
    label: "Deeply Rooted Variant Jade",
    link: { key: TAB_KEY.jadeDeepVariant, name: TAB_KEY.jadeDeepVariant },
    date: "12-11-2025",
  },
  {
    tag: "Done",
    label: "Equipment (Ancient, Kilos, Named EOD), Jade (Lunar, Skill, Erosion), Heraldry (Ancient Goddess), Talisman (Black Dragon, Eternal).",
    date: "Not Recorded",
  },
  {
    tag: "Done",
    label: "Dimensional Dragon Jade",
    link: {
      key: TAB_KEY.jadeSkill,
      name: TAB_KEY.jadeSkill,
      payload: { skillJadeScreen: { tabOpen: ["7"] } },
    },
    date: "03-02-2025",
  },
  {
    tag: "Done",
    label: "Ancient Lunar Jade Enhancement Calculator",
    link: {
      key: TAB_KEY.jadeLunar,
      name: TAB_KEY.jadeLunar,
      payload: { lunarScreen: { tabOpen: ["4"] } },
    },
    date: "23-02-2025",
  },
  {
    tag: "Done",
    label: "Conversion Costume Calculator",
    link: { key: TAB_KEY.miscConversion, name: TAB_KEY.miscConversion },
    date: "04-04-2025",
  },
  {
    tag: "Done",
    label: "Bone Dragon Armor & Weapon Calculator",
    link: { key: TAB_KEY.eqBoneDragon, name: TAB_KEY.eqBoneDragon },
    date: "26-05-2025",
  },
  {
    tag: "Done",
    label: "Conversion Costume Armor Legend Enhancement",
    link: { key: TAB_KEY.miscConversion, name: TAB_KEY.miscConversion },
    date: "28-05-2025",
  },
  {
    tag: "Done",
    label: "Bestie Spirit & Mount Calculator",
    link: { key: TAB_KEY.miscBestie, name: TAB_KEY.miscBestie },
    date: "04-07-2025",
  },
  {
    tag: "Done",
    label: "Enhancement for Ancient Goddess Heraldry",
    link: { key: TAB_KEY.heraldryAncientGoddes, name: TAB_KEY.heraldryAncientGoddes },
    date: "08-07-2025",
  },
  {
    tag: "Done",
    label: "VIP accessories",
    link: { key: TAB_KEY.eqVIPAcc, name: TAB_KEY.eqVIPAcc },
    date: "07-09-2025",
  },
  {
    tag: "Done",
    label: "Otherworldly Dragon Jade",
    link: {
      key: TAB_KEY.jadeSkill,
      name: TAB_KEY.jadeSkill,
      payload: { skillJadeScreen: { tabOpen: ["8"] } },
    },
    date: "07-09-2025",
  },
  {
    tag: "Update",
    label: "Ancient's Equipment Cost Changes",
    link: { key: TAB_KEY.eqAncient, name: TAB_KEY.eqAncient },
    date: "10-09-2025",
  },
  {
    tag: "Done",
    label: "Spun Gold Equipment",
    link: { key: TAB_KEY.eqSpunGold, name: TAB_KEY.eqSpunGold },
    date: "12-09-2025",
  },
  {
    tag: "Done",
    label: "Collapse Dragon Jade",
    link: { key: TAB_KEY.jadeCollapse, name: TAB_KEY.jadeCollapse },
    date: "25-09-2025",
  },
  {
    tag: "Update",
    label: "Spun Gold Equipment - Evolver Mats calculator",
    link: { key: TAB_KEY.eqSpunGold, name: TAB_KEY.eqSpunGold },
    date: "08-10-2025",
  },
  {
    tag: "Update",
    label: "Bestie Spirit & Mount v3",
    link: { key: TAB_KEY.miscBestie, name: TAB_KEY.miscBestie },
    date: "22-10-2025",
  },
  {
    tag: "Update",
    label: "Enhancement Legend Conversion Accessories (+1 to +3)",
    link: { key: TAB_KEY.miscConversion, name: TAB_KEY.miscConversion },
    date: "23-10-2025",
  },
  {
    tag: "Update",
    label: "Enhancement Iona Accessories (+13 to +15)",
    link: { key: TAB_KEY.eqVIPAcc, name: TAB_KEY.eqVIPAcc },
    date: "30-10-2025",
  },
  {
    tag: "Done",
    label: "Arc of Transcendence, Season 2 [Future]",
    link: { key: TAB_KEY.stageArcOfTranscen, name: TAB_KEY.stageArcOfTranscen },
    date: "4-11-2025",
  },
  {
    tag: "Update",
    label: "Conversion charts",
    link: { key: TAB_KEY.miscConversion, name: TAB_KEY.miscConversion },
    date: "09-11-2025",
  },
  {
    tag: "Update",
    label: "Arc of Transcendence, Season 3 [Past]",
    link: { key: TAB_KEY.stageArcOfTranscen, name: TAB_KEY.stageArcOfTranscen },
    date: "10-11-2025",
  },
];

const dataPastUpdate: FeatureItem[] = [
  {
    tag: "Update",
    label: "Enhancement Legend Conversion Weapon & WTD (+1 to +3)",
    link: { key: TAB_KEY.miscConversion, name: TAB_KEY.miscConversion },
    date: "06-02-2026",
  },
  {
    tag: "Update",
    label: "VIP Accessories charts",
    link: { key: TAB_KEY.eqVIPAcc, name: TAB_KEY.eqVIPAcc },
    date: "17-11-2025",
  },
  { tag: "Done", label: "Patch Note link for some existing item in Help bar (question mark in bottom right corner)" },
  { tag: "Done", label: "Success rate note on all of the skill jade" },
  { tag: "Done", label: "Make Chart Visualization", date: "09-11-2025" },
  { tag: "Done", label: "Add preference 'Stay on last opened screen'", date: "10-11-2025" },
  { tag: "Update", label: "Update Chart Visualization to show data by total or step", date: "18-11-2025" },
];

const ReleaseHistoryContent = () => {
  const dispatch = useAppDispatch();

  const renderItem = (item: FeatureItem, idx: number) => (
    <div
      key={idx}
      className="flex items-start gap-3 py-2 border-b last:border-0"
    >
      <Badge variant={TAG_VARIANT[item.tag]} className="shrink-0 mt-0.5 text-xs">
        {item.tag}
      </Badge>
      <div className="flex-1 min-w-0">
        <span className="text-sm">{item.label}</span>
        {item.link && (
          <button
            className="ml-2 text-xs text-primary hover:underline inline-flex items-center gap-0.5"
            onClick={() => dispatch(setSelectedSideBar(item.link!))}
          >
            <ExternalLink className="h-3 w-3" />
            Check Out
          </button>
        )}
        {item.date && (
          <span className="ml-2 text-xs text-muted-foreground">[{item.date}]</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">What's New</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {dataNew.map(renderItem)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {dataSoon.map(renderItem)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Release History — Functionality</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {dataPastFunc.map(renderItem)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Release History — Updates</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {dataPastUpdate.map(renderItem)}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReleaseHistoryContent;
