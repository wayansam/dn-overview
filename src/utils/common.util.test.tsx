import { render, screen } from "@testing-library/react";
import { EmptyCommonnStat } from "../constants/Common.constants";
import { ITEM_RARITY_COLOR } from "../constants/InGame.color.constants";
import { ITEM_RARITY } from "../constants/InGame.constants";
import {
  columnCommonItemFlag,
  CommonItemStats,
} from "../interface/ItemStat.interface";
import {
  combineEqStats,
  copyTextToClipboard,
  getAllStatDesc,
  getBDTalisFd,
  getBreakTag,
  getColor,
  getColumnsStats,
  getComparedData,
  getCustomColumnResource,
  getDeductTag,
  getStatDesc,
  getStatDif,
  getSuccessRateTag,
  getTextEmpty,
  multiplyEqStats,
} from "./common.util";

const statKeys = Object.keys(EmptyCommonnStat).filter(
  (key) => key !== "encLevel"
) as (keyof CommonItemStats)[];

describe("getColor", () => {
  test.each([
    [ITEM_RARITY.NORMAL, ITEM_RARITY_COLOR.NORMAL],
    [ITEM_RARITY.MAGIC, ITEM_RARITY_COLOR.MAGIC],
    [ITEM_RARITY.RARE, ITEM_RARITY_COLOR.RARE],
    [ITEM_RARITY.EPIC, ITEM_RARITY_COLOR.EPIC],
    [ITEM_RARITY.UNIQUE, ITEM_RARITY_COLOR.UNIQUE],
    [ITEM_RARITY.LEGEND, ITEM_RARITY_COLOR.LEGEND],
    [ITEM_RARITY.ANCIENT, ITEM_RARITY_COLOR.ANCIENT],
  ])("maps %s to its color", (rarity, color) => {
    expect(getColor(rarity)).toBe(color);
  });

  test("falls back to the custom color, then the craft color", () => {
    expect(getColor(ITEM_RARITY.CRAFT, "#123456")).toBe("#123456");
    expect(getColor(ITEM_RARITY.CRAFT)).toBe(ITEM_RARITY_COLOR.CRAFT);
  });
});

describe("getBDTalisFd", () => {
  test("returns the FD steps per rarity", () => {
    expect(getBDTalisFd(ITEM_RARITY.UNIQUE)).toEqual([0, 149, 298]);
    expect(getBDTalisFd(ITEM_RARITY.LEGEND)).toEqual([149, 298, 447]);
    expect(getBDTalisFd(ITEM_RARITY.ANCIENT)).toEqual([298, 447, 596]);
    expect(getBDTalisFd(ITEM_RARITY.EPIC)).toEqual([]);
  });
});

describe("getTextEmpty", () => {
  test("formats values with an optional suffix", () => {
    expect(getTextEmpty({ txt: 1234567 })).toBe((1234567).toLocaleString());
    expect(getTextEmpty({ txt: "5", tailText: "%" })).toBe("5%");
  });

  test("shows a placeholder for empty values, including 0", () => {
    expect(getTextEmpty({ txt: undefined })).toBe("-");
    expect(getTextEmpty({ txt: "" })).toBe("-");
    expect(getTextEmpty({ txt: 0, customChange: "none" })).toBe("none");
  });
});

describe("getComparedData", () => {
  const levels = ["L0", "L1", "L2", "L3"];

  test("picks entries by 1-based position", () => {
    expect(getComparedData(levels, 1, 3)).toEqual({ dt1: "L0", dt2: "L2" });
  });

  test("returns undefined for positions out of range", () => {
    expect(getComparedData(levels, 0, 5)).toEqual({
      dt1: undefined,
      dt2: undefined,
    });
  });
});

describe("combineEqStats", () => {
  test("adds and subtracts numeric stats", () => {
    const a: CommonItemStats = { encLevel: "5", crt: 100, fd: 10 };
    const b: CommonItemStats = { encLevel: "2", crt: 40, fd: 3 };
    expect(combineEqStats(a, b, "add")).toEqual({
      encLevel: "5",
      crt: 140,
      fd: 13,
    });
    expect(combineEqStats(a, b, "minus")).toEqual({
      encLevel: "5",
      crt: 60,
      fd: 7,
    });
  });

  test("does not mutate its inputs", () => {
    const a: CommonItemStats = { encLevel: "1", crt: 1 };
    combineEqStats(a, { encLevel: "1", crt: 2 }, "add");
    expect(a.crt).toBe(1);
  });

  test("summing into EmptyCommonnStat keeps every stat of the operand", () => {
    const dt: CommonItemStats = { encLevel: "3", cdm: 500, hp: 9000 };
    const sum = combineEqStats({ ...EmptyCommonnStat }, dt, "add");
    expect(sum.cdm).toBe(500);
    expect(sum.hp).toBe(9000);
    expect(sum.crt).toBe(0);
  });

  // Only stats present on both sides are combined: a stat that exists only
  // on the right-hand side is left out. Callers rely on starting from
  // EmptyCommonnStat (which lists every stat) to avoid losing values.
  test("ignores stats missing from the left-hand side", () => {
    const sum = combineEqStats({ encLevel: "0" }, { encLevel: "0", fd: 5 }, "add");
    expect(sum.fd).toBeUndefined();
  });
});

describe("multiplyEqStats", () => {
  test("multiplies every numeric stat and keeps the rest", () => {
    expect(multiplyEqStats({ encLevel: "2", crt: 10, fd: 1.5 }, 3)).toEqual({
      encLevel: "2",
      crt: 30,
      fd: 4.5,
    });
  });
});

describe("stat descriptions", () => {
  test.each(statKeys)("%s has a description", (key) => {
    const desc = getStatDesc(key);
    expect(desc.long).not.toBe("-");
    expect(desc.short).not.toBe("-");
  });

  test("getAllStatDesc covers every stat", () => {
    const all = getAllStatDesc() as unknown as Record<string, unknown>;
    for (const key of statKeys) {
      expect(all[`${key}Desc`]).toEqual(getStatDesc(key));
    }
  });
});

describe("rate tags", () => {
  test("getSuccessRateTag warns when any rate is below 100%", () => {
    render(<>{getSuccessRateTag("Helm", [100, 80])}</>);
    expect(screen.getByText("might fail")).toBeInTheDocument();
  });

  test("getSuccessRateTag shows success when every rate is 100%", () => {
    render(<>{getSuccessRateTag("Helm", [100, 100])}</>);
    expect(screen.getByText("100% success")).toBeInTheDocument();
  });

  test("getBreakTag and getDeductTag only render for non-zero chances", () => {
    expect(getBreakTag("Helm", [0, 0])).toBeUndefined();
    expect(getDeductTag("Helm", [0])).toBeUndefined();

    render(
      <>
        {getBreakTag("Helm", [0, 5])}
        {getDeductTag("Helm", [1])}
      </>
    );
    expect(screen.getByText("might break")).toBeInTheDocument();
    expect(screen.getByText("might -1")).toBeInTheDocument();
  });
});

describe("getColumnsStats", () => {
  const allFlags = Object.fromEntries(
    statKeys.map((key) => [`${key}Flag`, true])
  ) as columnCommonItemFlag;
  // Every stat set to 7, so each cell's formatting is easy to check.
  const row = Object.fromEntries([
    ["encLevel", "5"],
    ...statKeys.map((key) => [key, 7]),
  ]) as CommonItemStats;

  const renderCell = (column: ReturnType<typeof getColumnsStats>[number]) => {
    const cell = (column as { render?: Function }).render?.(undefined, row, 0);
    return render(<>{cell}</>).container.textContent;
  };

  test("without flags only the level and compact columns remain", () => {
    const columns = getColumnsStats({});
    expect(columns).toHaveLength(2);
    expect(columns[0].title).toBe("Enhancement");
  });

  test("adds one column per flagged stat, min and max sharing one", () => {
    const [, , ...statColumns] = getColumnsStats(allFlags);
    const expected = statKeys
      .filter((key) => key !== "phyMagAtkMin" && key !== "phyMagAtkMax")
      .map((key) => getStatDesc(key).long);
    // The min - max column reuses the Attack title, right after Attack.
    expected.splice(1, 0, getStatDesc("phyMagAtk").long);
    expect(statColumns.map((column) => column.title)).toEqual(expected);
  });

  test("formats each cell", () => {
    const [, , atk, atkRange, atkPercent] = getColumnsStats(allFlags);
    expect(renderCell(atk)).toBe("7");
    expect(renderCell(atkRange)).toBe("7 - 7");
    expect(renderCell(atkPercent)).toBe("7%");
  });

  test("the compact column lists every flagged stat", () => {
    const [, compact] = getColumnsStats(allFlags);
    const text = renderCell(compact);
    for (const key of statKeys) {
      if (key === "phyMagAtkMin" || key === "phyMagAtkMax") continue;
      expect(text).toContain(getStatDesc(key).short);
    }
  });

  test("shows a placeholder for stats a row does not have", () => {
    const [, , atk] = getColumnsStats({ phyMagAtkFlag: true });
    const cell = (atk as { render: Function }).render(undefined, { encLevel: "0" }, 0);
    expect(render(<>{cell}</>).container.textContent).toBe("-");
  });
});

describe("getStatDif", () => {
  test("is empty without stats", () => {
    expect(getStatDif()).toEqual([]);
  });

  test("lists every stat with its short name", () => {
    const titles = getStatDif({ ...EmptyCommonnStat, crt: 5 }).map(
      (item) => item.title
    );
    expect(titles).toContain(getStatDesc("crt").short);
  });
});

describe("getCustomColumnResource", () => {
  test("renames the material and amount columns", () => {
    const [mats, amount] = getCustomColumnResource({
      customMatsTitle: "Name",
      customAmountTitle: "Qty",
    });
    expect(mats.title).toBe("Name");
    expect(amount.title).toBe("Qty");
  });

  test("keeps the default titles otherwise", () => {
    const [mats, amount] = getCustomColumnResource({});
    expect(mats.title).toBe("Materials");
    expect(amount.title).toBe("Amount");
  });
});

describe("copyTextToClipboard", () => {
  const writeText = vi.fn();
  beforeEach(() => {
    writeText.mockReset();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  test("writes the text to the clipboard", async () => {
    await copyTextToClipboard("hello");
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  test("swallows clipboard errors", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    await expect(copyTextToClipboard("hello")).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});
