import { PatchNoteSection } from "../../../components/PatchNoteLink";
import { TAB_KEY } from "../../../constants/Common.constants";
import { HelpItem } from "./helpItem.type";

export const stageHelpItems: HelpItem[] = [
  {
    key: TAB_KEY.stageFissionMaze,
    label: TAB_KEY.stageFissionMaze,
    children: (
      <div>
        <PatchNoteSection
          entries={[
            {
              href: "https://patchnote.dragonnest.com/sea/81/c/1",
              label: "Fission Maze Erosion Mode (Labyrinth 18F-24F)",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/180/c/7",
              label:
                "Ascension Difficulty Split - Erosion Rewards (3-1F to 6-2F)",
            },
          ]}
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.stageNSTG,
    label: TAB_KEY.stageNSTG,
    children: (
      <div>
        <PatchNoteSection
          entries={[
            {
              href: "https://patchnote.dragonnest.com/sea/150/c/1",
              label: "Night Shadow Training Ground (Labyrinth 15F-Dimension 4F)",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/160/c/6",
              label: "Labyrinth to Ascension Difficulty Merge",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/180/c/7",
              label: "Difficulty Expansion & Split (3-1F to Dimension 14F)",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/197/c/1",
              label: "Resonance Mission - Paradox Frozen Dragon Nest",
            },
          ]}
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.stageArcOfTranscen,
    label: TAB_KEY.stageArcOfTranscen,
    children: (
      <div>
        <PatchNoteSection
          entries={[
            {
              href: "https://patchnote.dragonnest.com/sea/94/c/1",
              label: "Ark of Transcendence Season 1 [Past]",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/102/c/4",
              label: "Ark of Transcendence Season 1 [Present]",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/114/c/1",
              label: "Ark of Transcendence Season 1 [Future]",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/129/c/5",
              label: "Ark of Transcendence Season 2 [Past]",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/142/c/1",
              label: "Ark of Transcendence Season 2 [Present]",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/153/c/3",
              label: "Ark of Transcendence Season 2 [Future]",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/166/c/5",
              label: "Ark of Transcendence Season 3 [Past]",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/177/c/1",
              label: "Ark of Transcendence Season 3 [Present]",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/187/c/3",
              label: "Ark of Transcendence Season 3 [Future]",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/199/c/1",
              label: "Ark of Transcendence Season 4 [Past]",
            },
          ]}
        />
      </div>
    ),
  },
];
