import { Card } from "antd";
import { ReactNode } from "react";
import ReleaseNotes from "../ReleaseNotes";
import CharacterWidget from "./CharacterWidget";

export interface Widget {
  // Saved in localStorage, so never rename an existing key.
  key: string;
  label: string;
  render: () => ReactNode;
}

// Widgets the user can pick for the General dashboard, in default order.
export const WIDGETS: Widget[] = [
  {
    key: "characters",
    label: "Characters",
    render: () => <CharacterWidget />,
  },
  {
    key: "releaseNotes",
    label: "Release Notes",
    render: () => (
      <Card size="small" title="Release Notes">
        <ReleaseNotes onlyNew={true} />
      </Card>
    ),
  },
];

export const WIDGET_KEYS = WIDGETS.map((item) => item.key);
