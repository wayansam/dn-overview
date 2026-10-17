// Behaviour of the screens built on EquipmentTable: picking equipment and an
// enhancement range produces a material list, and a narrower range costs less.
import { screen } from "@testing-library/react";
import { TAB_KEY } from "../../constants/Common.constants";
import {
  chooseOptionAt,
  getSelectByLabel,
  materialAmounts,
  renderScreen,
  selectAllRows,
  visitAllTabs,
} from "../../testUtils";

vi.mock("@ant-design/charts", () => ({
  Line: () => <div data-testid="chart" />,
}));

const DEFAULT_INVALID = "From cannot exceed the To option";

// `invalidMessage` is shown for an inverted From/To range; null means the
// screen has no From/To pickers (the range is edited per row instead).
const screens: { key: string; invalidMessage: string | null }[] = [
  { key: TAB_KEY.eqAncient, invalidMessage: DEFAULT_INVALID },
  { key: TAB_KEY.eqKilos, invalidMessage: DEFAULT_INVALID },
  { key: TAB_KEY.eqNamedEOD, invalidMessage: null },
  { key: TAB_KEY.eqBoneDragon, invalidMessage: DEFAULT_INVALID },
  { key: TAB_KEY.eqGoldDragon, invalidMessage: DEFAULT_INVALID },
  { key: TAB_KEY.eqIonaAcc, invalidMessage: DEFAULT_INVALID },
  { key: TAB_KEY.eqRubinartAcc, invalidMessage: DEFAULT_INVALID },
  { key: TAB_KEY.eqSpunGold, invalidMessage: DEFAULT_INVALID },
  // From === To is allowed here (craft only), hence its own message.
  { key: TAB_KEY.jadeGoldDragon, invalidMessage: "To cannot be lower than From" },
  { key: TAB_KEY.miscConversion, invalidMessage: DEFAULT_INVALID },
];
const withRange = screens.filter(
  (item): item is { key: string; invalidMessage: string } =>
    item.invalidMessage !== null
);

const total = (container: HTMLElement) =>
  materialAmounts(container).reduce((sum, amount) => sum + amount, 0);

const setRange = (
  container: HTMLElement,
  from: number | "last",
  to: number | "last"
) => {
  chooseOptionAt(getSelectByLabel(container, "From"), from);
  chooseOptionAt(getSelectByLabel(container, "To"), to);
};

beforeEach(() => localStorage.clear());

describe.each(screens)("$key", ({ key }) => {
  test("costs nothing until equipment is selected", () => {
    const { container } = renderScreen(key);
    expect(total(container)).toBe(0);
  });

  test("every tab renders", () => {
    const { container } = renderScreen(key);
    for (const label of visitAllTabs(container)) {
      expect(
        container.querySelector(".ant-tabs-tabpane-active"),
        label
      ).not.toBeEmptyDOMElement();
    }
  });
});

describe.each(withRange)("$key", ({ key, invalidMessage }) => {
  test("selecting all equipment over the full range lists materials", () => {
    const { container } = renderScreen(key);
    selectAllRows(container);
    setRange(container, 0, "last");

    expect(total(container)).toBeGreaterThan(0);
    expect(screen.queryByText(invalidMessage)).not.toBeInTheDocument();
  });

  test("a narrower range costs less", () => {
    const { container } = renderScreen(key);
    selectAllRows(container);
    setRange(container, 0, "last");
    const full = total(container);

    chooseOptionAt(getSelectByLabel(container, "From"), 1);
    expect(total(container)).toBeLessThan(full);
  });

  test("an inverted range is flagged instead of calculated", () => {
    const { container } = renderScreen(key);
    selectAllRows(container);
    setRange(container, "last", 0);

    expect(screen.getByText(invalidMessage)).toBeInTheDocument();
  });
});

test("Named EOD lists materials once equipment is selected", () => {
  const { container } = renderScreen(TAB_KEY.eqNamedEOD);
  selectAllRows(container);
  expect(total(container)).toBeGreaterThan(0);
});
