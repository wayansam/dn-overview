import Collapse, { CollapseProps } from "antd/es/collapse";
import ListingCard, { ItemList } from "../components/ListingCard";

export interface RateSummaryField {
  key: string;
  title: string;
  tag?: (key: string, values: any) => React.ReactNode;
  suffix?: string;
}

// The repeated "per-equipment Collapse of rate-tag-decorated ListingCards"
// summary used to render tableResource.res2-style extra data (success/break
// rates etc). `fields` picks which rate arrays to show and how to tag them —
// values not present in `data` (e.g. a Jelly total) aren't part of this loop
// and should be prepended/appended by the caller instead.
export function buildRateSummary(
  data: Record<string, Record<string, Array<number | undefined>> | undefined>,
  fields: RateSummaryField[]
): ItemList[] {
  const list: ItemList[] = [];
  const items: CollapseProps["items"] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (!value) {
      return;
    }
    items.push({
      key,
      styles: {
        header: {
          padding: "4px 4px 0px 4px",
        },
        body: {
          padding: "0px 4px",
          marginTop: 8,
          marginBottom: 8,
        },
      },
      label: (
        <div>
          {`${key} `}
          {fields.map((field) => field.tag?.(key, value[field.key]))}
        </div>
      ),
      children: (
        <ListingCard
          data={fields.map((field) => ({
            title: `${key} ${field.title} : `,
            value: value[field.key]
              ?.map((it) => `${it}${field.suffix ?? ""}`)
              .join(", "),
          }))}
        />
      ),
    });
  });

  if (items.length > 0) {
    list.push({
      title: "Summary",
      isHeader: true,
      children: (
        <Collapse ghost key={"summary-item"} items={items} size="small" />
      ),
    });
  }

  return list;
}
