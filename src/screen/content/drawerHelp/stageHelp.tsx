import { PatchNoteSection } from "../../../components/PatchNoteLink";
import { TAB_KEY } from "../../../constants/Common.constants";
import { HelpItem } from "./helpItem.type";

export const stageHelpItems: HelpItem[] = [
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
          ]}
        />
      </div>
    ),
  },
];
