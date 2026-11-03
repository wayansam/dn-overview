// Bestie's growth form and Conversion's "what should I upgrade next"
// suggestion engine.
import { act, fireEvent, screen, within } from "@testing-library/react";
import { TAB_KEY } from "../../../constants/Common.constants";
import {
  chooseOption,
  getSelectByPlaceholder,
  materialAmounts,
  openAllPanels,
  renderScreen,
} from "../../../testUtils";

vi.mock("@ant-design/charts", () => ({
  Line: () => <div data-testid="chart" />,
}));

const click = (element: Element) =>
  act(() => {
    fireEvent.click(element);
  });

const total = (container: HTMLElement) =>
  materialAmounts(container).reduce((sum, amount) => sum + amount, 0);

beforeEach(() => localStorage.clear());

describe("Bestie", () => {
  const growCard = (n = 1) =>
    screen.getByText(`Grow ${n}`).closest(".ant-card") as HTMLElement;

  // Moves the upper handle of the newest range slider in a Grow card.
  const raiseRangeEnd = (card: HTMLElement, steps: number) => {
    const upper = within(card).getAllByRole("slider").pop()!;
    for (let i = 0; i < steps; i++) {
      act(() => {
        fireEvent.keyDown(upper, { key: "ArrowRight", keyCode: 39 });
      });
    }
    act(() => {
      fireEvent.keyUp(upper, { key: "ArrowRight", keyCode: 39 });
    });
  };

  const addRow = (card: HTMLElement, version: string) => {
    click(within(card).getByText("+ Add Enhancement"));
    click(within(card).getAllByText(version).pop()!);
  };

  test("starts by asking for something to calculate", () => {
    renderScreen(TAB_KEY.miscBestie);
    expect(
      screen.getByText("Nothing to calculate in Grow 1"),
    ).toBeInTheDocument();
  });

  test("a type without rows is reported", () => {
    renderScreen(TAB_KEY.miscBestie);
    click(within(growCard()).getByText("mount"));
    expect(screen.getByText("Empty List in Grow 1")).toBeInTheDocument();
  });

  test("flags a row without a range", () => {
    renderScreen(TAB_KEY.miscBestie);
    click(within(growCard()).getByText("mount"));
    addRow(growCard(), "V1");
    expect(
      screen.getByText("The Range in Grow 1, item 1 haven't inputted properly"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Some of the item you input is not valid"),
    ).toBeInTheDocument();
  });

  test.each([
    ["mount", "V1"],
    ["mount", "V2"],
    ["spirit", "V1"],
    ["spirit", "V3"],
  ])("%s %s lists growth materials once the range is set", (type, version) => {
    const { container } = renderScreen(TAB_KEY.miscBestie);
    click(within(growCard()).getByText(type));
    addRow(growCard(), version);
    raiseRangeEnd(growCard(), 10);

    expect(total(container)).toBeGreaterThan(0);
    expect(
      screen.queryByText("Some of the item you input is not valid"),
    ).not.toBeInTheDocument();
  });

  test("a second type adds to the total", () => {
    const { container } = renderScreen(TAB_KEY.miscBestie);
    click(within(growCard()).getByText("mount"));
    addRow(growCard(), "V1");
    raiseRangeEnd(growCard(), 10);
    const single = total(container);

    click(screen.getByText("+ Add Type"));
    click(within(growCard(2)).getByText("spirit"));
    addRow(growCard(2), "V1");
    raiseRangeEnd(growCard(2), 10);
    expect(total(container)).toBeGreaterThan(single);
  });

  test("removing the only row leaves the list empty again", () => {
    renderScreen(TAB_KEY.miscBestie);
    click(within(growCard()).getByText("mount"));
    addRow(growCard(), "V1");
    const closeIcons = growCard().querySelectorAll(".anticon-close");
    click(closeIcons[closeIcons.length - 1]);
    expect(screen.getByText("Empty List in Grow 1")).toBeInTheDocument();
  });

  test("every reference panel opens", () => {
    const { container } = renderScreen(TAB_KEY.miscBestie);
    openAllPanels(container);
    expect(
      container.querySelectorAll(
        ".ant-collapse-item:not(.ant-collapse-item-active)",
      ),
    ).toHaveLength(0);
  });
});

describe("Conversion suggestion", () => {
  // The InputNumber next to an owned-resource label.
  const setOwned = (label: string, value: number) => {
    const row = screen.getByText(label, { selector: "span.ant-typography" })
      .parentElement as HTMLElement;
    act(() => {
      fireEvent.change(row.querySelector("input")!, {
        target: { value: String(value) },
      });
    });
  };

  const OWNED = [
    "Armor Fragment",
    "Acc Fragment",
    "Wtd Fragment",
    "Weapon Fragment",
    "Astral Powder",
    "Astral Stone",
    "Astral Jewel",
  ];

  const prioritize = (container: HTMLElement, stat: string) =>
    chooseOption(
      getSelectByPlaceholder(container, "Select a stat to prioritize"),
      stat,
    );

  test("shows nothing until a stat is picked", () => {
    renderScreen(TAB_KEY.miscConversion);
    expect(
      screen.queryByText("Recommended Upgrades (within owned resources)"),
    ).not.toBeInTheDocument();
  });

  // Weapons have no "buy" step, so their first tap is free and there's
  // always something affordable; Plan B is what's worth saving up for.
  test("with nothing owned, Plan B has something to save up for", () => {
    const { container } = renderScreen(TAB_KEY.miscConversion);
    prioritize(container, "Attack");
    // One "Option 1" in the affordable list, one in Plan B.
    expect(screen.getAllByText(/^Option 1 — Total: \+/)).toHaveLength(2);
    expect(
      screen.queryByText("Nothing beats Option 1 by saving up right now."),
    ).not.toBeInTheDocument();
  });

  test("a modest pool gets ranked options and a bigger Plan B", () => {
    const { container } = renderScreen(TAB_KEY.miscConversion);
    OWNED.forEach((label) => setOwned(label, 30));
    prioritize(container, "Attack");

    const options = screen.getAllByText(/^Option \d — Total: \+/);
    // At least one affordable option plus at least one Plan B.
    expect(options.length).toBeGreaterThan(1);
    expect(
      screen.queryByText("Not enough resources for any single tap yet."),
    ).not.toBeInTheDocument();
  });

  test("an unlimited pool maxes everything, leaving nothing to save for", () => {
    const { container } = renderScreen(TAB_KEY.miscConversion);
    OWNED.forEach((label) => setOwned(label, 9_999_999));
    prioritize(container, "Attack");

    expect(
      screen.getAllByText(/^Option \d — Total: \+/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("Nothing beats Option 1 by saving up right now."),
    ).toBeInTheDocument();
  });

  test("a percent stat is shown with a % suffix", () => {
    const { container } = renderScreen(TAB_KEY.miscConversion);
    OWNED.forEach((label) => setOwned(label, 9_999_999));
    prioritize(container, "Attack(%)");
    expect(
      screen.getAllByText(/^Option 1 — Total: \+[\d.,]+% using/),
    ).not.toHaveLength(0);
  });
});
