import { TAB_KEY } from "../../../constants/Common.constants";
import { HelpItem } from "./helpItem.type";

export const mainHelpItems: HelpItem[] = [
  {
    key: TAB_KEY.mainId,
    label: TAB_KEY.mainId,
    children: (
      <div>
        <p>
          An ID groups several characters, like an in-game account. Up to 5
          IDs, names must be unique.
        </p>
        <p>
          Expand a row to see its characters. Deleting an ID keeps its
          characters, they just lose the ID.
        </p>
        <p>Data is saved in this browser only.</p>
      </div>
    ),
  },
  {
    key: TAB_KEY.mainCharacter,
    label: TAB_KEY.mainCharacter,
    children: (
      <div>
        <p>
          The table lists every character, with filters and adjustable
          columns. Details opens a character, use Edit there to change it.
          Add creates a new one (up to 25).
        </p>
        <p>
          Names are letters and numbers only, up to 15 characters, and must be
          unique. Only one character can be main.
        </p>
        <p>Data is saved in this browser only.</p>
      </div>
    ),
  },
  {
    key: TAB_KEY.mainTask,
    label: TAB_KEY.mainTask,
    children: (
      <div>
        <p>
          Use Add to track a task, optionally for an ID and a character. Picking
          an ID narrows the character list.
        </p>
        <p>
          Done records today as Last Cleared, Reset clears it back to "-".
        </p>
        <p>Data is saved in this browser only.</p>
      </div>
    ),
  },
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
