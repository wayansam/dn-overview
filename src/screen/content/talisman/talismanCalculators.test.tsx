// The talisman screens: a Collapse of Stats / Mats reference panels plus one
// range-slider calculator per talisman (RangeCalculatorPanel).
import { act, fireEvent, screen, within } from "@testing-library/react";
import { TAB_KEY } from "../../../constants/Common.constants";
import {
  chooseOption,
  getSelectByLabel,
  materialAmounts,
  openAllPanels,
  renderScreen,
} from "../../../testUtils";

const total = (container: HTMLElement) =>
  materialAmounts(container).reduce((sum, amount) => sum + amount, 0);

// The calculator panel under a top-level Collapse header.
const panel = (label: string) => {
  const header = screen
    .getAllByText(label)
    .map((el) => el.closest(".ant-collapse-item"))
    .find((item) => item?.querySelector('[role="slider"]'));
  if (!header) throw new Error(`No calculator panel "${label}"`);
  return header as HTMLElement;
};

const openPanel = (label: string) => {
  const header = screen
    .getAllByText(label)
    .map((el) => el.closest(".ant-collapse-header"))
    .find(Boolean)!;
  act(() => {
    fireEvent.click(header);
  });
  return panel(label);
};

// Moves a slider handle (0 = lower, 1 = upper) by `steps`, as with the
// arrow keys; releasing the key commits the change.
const moveHandle = (container: HTMLElement, handle: 0 | 1, steps: number) => {
  const slider = within(container).getAllByRole("slider")[handle];
  const key = steps > 0 ? "ArrowRight" : "ArrowLeft";
  const keyCode = steps > 0 ? 39 : 37;
  for (let i = 0; i < Math.abs(steps); i++) {
    act(() => {
      fireEvent.keyDown(slider, { key, keyCode });
    });
  }
  act(() => {
    fireEvent.keyUp(slider, { key, keyCode });
  });
};

const click = (element: Element) =>
  act(() => {
    fireEvent.click(element);
  });

beforeEach(() => localStorage.clear());

describe.each([
  TAB_KEY.talismanBlackDragon,
  TAB_KEY.talismanEternal,
  TAB_KEY.talismanParadox,
])("%s", (key) => {
  test("every reference panel opens", () => {
    const { container } = renderScreen(key);
    openAllPanels(container);
    expect(
      container.querySelectorAll(
        ".ant-collapse-item:not(.ant-collapse-item-active)",
      ),
    ).toHaveLength(0);
    expect(container.querySelectorAll("table").length).toBeGreaterThan(3);
  });
});

// The reference tables have phone-only (xs) and wider (sm) columns. jsdom
// has no screen width and setupTests' matchMedia matches no breakpoint, which
// hides both; matching every breakpoint shows them all.
describe.each([
  TAB_KEY.talismanBlackDragon,
  TAB_KEY.talismanEternal,
  TAB_KEY.talismanParadox,
])("%s with every breakpoint matched", (key) => {
  const original = window.matchMedia;
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      ...original(query),
      matches: true,
    })) as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = original;
  });

  test("shows the phone and wide columns of every table", () => {
    const { container } = renderScreen(key);
    openAllPanels(container);
    const headers = Array.from(container.querySelectorAll("th")).map(
      (th) => th.textContent,
    );
    // Gold is a wide-only column of every mats table.
    expect(headers).toContain("Gold");
    expect(total(container)).toBeGreaterThan(0);
  });
});

describe("Black Dragon's", () => {
  test.each(["Baofa", "Umbala", "Meluka", "Titanion"])(
    "%s: a narrower range costs less",
    (label) => {
      renderScreen(TAB_KEY.talismanBlackDragon);
      const calc = label === "Baofa" ? panel(label) : openPanel(label);
      const full = total(calc);
      expect(full).toBeGreaterThan(0);

      moveHandle(calc, 0, 2);
      expect(total(calc)).toBeLessThan(full);
    },
  );

  test.each(["Baofa", "Umbala", "Meluka", "Titanion"])(
    "%s: Legend is flagged as non craftable",
    (label) => {
      renderScreen(TAB_KEY.talismanBlackDragon);
      const calc = label === "Baofa" ? panel(label) : openPanel(label);
      expect(
        within(calc).queryByText("Legend Talisman is non craftable"),
      ).not.toBeInTheDocument();

      moveHandle(calc, 1, 1);
      expect(
        within(calc).getByText("Legend Talisman is non craftable"),
      ).toBeInTheDocument();
      expect(total(calc)).toBe(0);
    },
  );
});

describe("Eternal", () => {
  test.each(["Eternal World Talisman", "Eternal Pain Talisman"])(
    "%s: a narrower range costs less and shows the stat increase",
    (label) => {
      renderScreen(TAB_KEY.talismanEternal);
      const calc =
        label === "Eternal World Talisman" ? panel(label) : openPanel(label);
      const full = total(calc);
      expect(full).toBeGreaterThan(0);
      expect(within(calc).getByText(/^ATK \+/)).toBeInTheDocument();

      moveHandle(calc, 0, 1);
      expect(total(calc)).toBeLessThan(full);
      expect(within(calc).getByText(/^ATK \+/)).toBeInTheDocument();
    },
  );
});

describe("Paradox", () => {
  const calc = () => panel("Paradox Talisman");

  test("the full range lists mats and warns about failing", () => {
    renderScreen(TAB_KEY.talismanParadox);
    expect(total(calc())).toBeGreaterThan(0);
    expect(
      within(calc()).getByText(
        "Failing at +12 and above drops the talisman 1 level",
      ),
    ).toBeInTheDocument();
    expect(
      within(calc()).getByText(
        "Mats assume every attempt succeeds on the first try",
      ),
    ).toBeInTheDocument();
  });

  test("the guaranteed levels carry no warnings", () => {
    renderScreen(TAB_KEY.talismanParadox);
    // +0..+15 down to +0..+5, where every attempt is 100%.
    moveHandle(calc(), 1, -10);
    expect(within(calc()).queryByText(/^Failing at/)).not.toBeInTheDocument();
    expect(within(calc()).queryByText(/^Mats assume/)).not.toBeInTheDocument();
  });

  test("evolving to Blessed adds the bonus and total cards", () => {
    renderScreen(TAB_KEY.talismanParadox);
    expect(within(calc()).getByText("Status Increase")).toBeInTheDocument();
    expect(
      within(calc()).queryByText("+ Blessed Evolution Bonus"),
    ).not.toBeInTheDocument();

    click(within(calc()).getByText("Evolve to Blessed"));
    expect(
      within(calc()).getByText("+ Blessed Evolution Bonus"),
    ).toBeInTheDocument();
    expect(within(calc()).getByText("= Total Increase")).toBeInTheDocument();
    expect(
      within(calc()).getByText("Evolution Item : 1 Kaunos Fragment"),
    ).toBeInTheDocument();
    // Kaunos +0 → +15 is CRT +283,000; Blessed adds +192,000.
    expect(
      within(calc()).getByText(`CRT +${(283000).toLocaleString()}`),
    ).toBeInTheDocument();
    expect(
      within(calc()).getByText(`CRT +${(192000).toLocaleString()}`),
    ).toBeInTheDocument();
    expect(
      within(calc()).getByText(`CRT +${(475000).toLocaleString()}`),
    ).toBeInTheDocument();
  });

  test("picking another talisman changes the stats shown", () => {
    const { container } = renderScreen(TAB_KEY.talismanParadox);
    chooseOption(getSelectByLabel(container, "Talisman"), "Shalica");
    click(within(calc()).getByText("Evolve to Blessed"));
    expect(
      within(calc()).getByText("Evolution Item : 1 Shalica's Chains"),
    ).toBeInTheDocument();
    expect(within(calc()).queryByText(/^CRT/)).not.toBeInTheDocument();
  });
});
