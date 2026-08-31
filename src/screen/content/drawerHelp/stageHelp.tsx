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
              href: "https://patchnote.dragonnest.com/sea/153/c/3",
              label: "Arc of Transcendence Season 2 [Future]",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/166/c/5",
              label: "Arc of Transcendence Season 3 [Past]",
            },
          ]}
        />
      </div>
    ),
  },
];
