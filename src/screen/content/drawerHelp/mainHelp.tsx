import { TAB_KEY } from "../../../constants/Common.constants";
import { HelpItem } from "./helpItem.type";

export const mainHelpItems: HelpItem[] = [
  {
    key: TAB_KEY.mainCompare,
    label: TAB_KEY.mainCompare,
    children: (
      <div>
        <p>
          Pick an equipment line, slot and enhancement level for Equipment A
          and Equipment B.
        </p>
        <p>
          The table lists every stat either equipment has, and the Difference
          column shows B minus A. Flat stats also show the change in percent
          relative to A.
        </p>
        <p>
          Use Swap to flip A and B. Only base stats per enhancement level are
          compared, random add-on stats are not included.
        </p>
      </div>
    ),
  },
];
