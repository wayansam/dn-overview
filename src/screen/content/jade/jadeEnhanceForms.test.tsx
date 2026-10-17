// The "Enhance" panel of the Lunar and Collapse jade calculators (open by
// default): a form with one card per jade type, each holding amount + range
// rows.
import { act, fireEvent, screen, within } from "@testing-library/react";
import { TAB_KEY } from "../../../constants/Common.constants";
import {
  chooseOptionAt,
  getSelectByLabel,
  materialAmounts,
  renderScreen,
  selectAllRows,
} from "../../../testUtils";

vi.mock("@ant-design/charts", () => ({
  Line: () => <div data-testid="chart" />,
}));

const click = (element: Element) =>
  act(() => {
    fireEvent.click(element);
  });

const enhanceCard = () =>
  screen.getByText("Enhance 1").closest(".ant-card") as HTMLElement;

const fillRow = (amount: number) => {
  const card = enhanceCard();
  click(within(card).getByText("+ Add Enhancement"));
  act(() => {
    fireEvent.change(within(card).getByPlaceholderText("amount"), {
      target: { value: String(amount) },
    });
  });
};

// Moves the upper slider handle up by `steps`, as with the arrow keys.
const raiseRangeEnd = (steps: number) => {
  const [, upper] = within(enhanceCard()).getAllByRole("slider");
  for (let i = 0; i < steps; i++) {
    act(() => {
      fireEvent.keyDown(upper, { key: "ArrowRight", keyCode: 39 });
    });
  }
  act(() => {
    fireEvent.keyUp(upper, { key: "ArrowRight", keyCode: 39 });
  });
};

const total = (container: HTMLElement) =>
  materialAmounts(container).reduce((sum, amount) => sum + amount, 0);

beforeEach(() => localStorage.clear());

describe("Lunar Jade", () => {
  test("starts by asking for something to calculate", () => {
    renderScreen(TAB_KEY.jadeLunar);
    expect(screen.getByText("Nothing to calculate in Enhance 1")).toBeInTheDocument();
  });

  test("flags a row without a range", () => {
    renderScreen(TAB_KEY.jadeLunar);
    click(within(enhanceCard()).getByText("Attack"));
    fillRow(2);
    expect(
      screen.getByText("The Range in Enhance 1, item 1 haven't inputted properly")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Some of the item you input is not valid")
    ).toBeInTheDocument();
  });

  test("lists materials once type, amount and range are set", () => {
    const { container } = renderScreen(TAB_KEY.jadeLunar);
    click(within(enhanceCard()).getByText("Attack"));
    fillRow(2);
    raiseRangeEnd(5);

    expect(total(container)).toBeGreaterThan(0);
    expect(
      screen.queryByText("Some of the item you input is not valid")
    ).not.toBeInTheDocument();
  });

  test("twice the amount costs twice as much", () => {
    const { container } = renderScreen(TAB_KEY.jadeLunar);
    click(within(enhanceCard()).getByText("Defense"));
    fillRow(1);
    raiseRangeEnd(5);
    const single = total(container);

    act(() => {
      fireEvent.change(within(enhanceCard()).getByPlaceholderText("amount"), {
        target: { value: "2" },
      });
    });
    expect(total(container)).toBe(single * 2);
  });

  // Craft panel: "Quantity" is jades per slot, and Min is 0 for every slot.
  const craftAllToAncient = (container: HTMLElement) => {
    selectAllRows(container);
    chooseOptionAt(getSelectByLabel(container, "To"), "last");
  };

  test("the Craft panel needs a quantity above the minimum of 0", () => {
    const { container } = renderScreen(TAB_KEY.jadeLunar);
    craftAllToAncient(container);
    expect(total(container)).toBe(0);

    click(screen.getByText("Mid"));
    expect(total(container)).toBeGreaterThan(0);
  });

  test("a higher craft quantity costs more", () => {
    const { container } = renderScreen(TAB_KEY.jadeLunar);
    craftAllToAncient(container);
    click(screen.getByText("Mid"));
    const mid = total(container);

    click(screen.getByText("Max"));
    expect(total(container)).toBeGreaterThan(mid);
  });
});

describe("Collapse Jade", () => {
  test("an amount alone is enough (the range is optional)", () => {
    const { container } = renderScreen(TAB_KEY.jadeCollapse);
    click(within(enhanceCard()).getByText("Attack"));
    fillRow(1);
    raiseRangeEnd(3);

    expect(total(container)).toBeGreaterThan(0);
  });

  test("a type without rows is reported", () => {
    renderScreen(TAB_KEY.jadeCollapse);
    click(within(enhanceCard()).getByText("Attack"));
    expect(screen.getByText("Empty List in Enhance 1")).toBeInTheDocument();
  });
});
