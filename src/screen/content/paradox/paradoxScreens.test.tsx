// Paradox Warrior tab: equipment progression calculator, Skill Dragon Jade
// calculator and the shop reference.
import { screen } from "@testing-library/react";
import { TAB_KEY } from "../../../constants/Common.constants";
import {
  dataParadoxCalculator,
  getParadoxMaterialTable,
  getParadoxPositionLabel,
  getParadoxPositionStats,
  PARADOX_MAX_POSITION,
  getParadoxCategory,
} from "../../../data/paradox/ParadoxEquipmentData";
import {
  chooseOption,
  chooseOptionAt,
  getSelectByLabel,
  materialAmounts,
  openAllPanels,
  renderScreen,
  selectAllRows,
} from "../../../testUtils";

vi.mock("@ant-design/charts", () => ({
  Line: () => <div data-testid="chart" />,
}));

const total = (container: HTMLElement) =>
  materialAmounts(container).reduce((sum, amount) => sum + amount, 0);

beforeEach(() => localStorage.clear());

describe("Paradox equipment data", () => {
  test("one material step and one stat row per position", () => {
    dataParadoxCalculator.forEach(({ equipment }) => {
      const max = PARADOX_MAX_POSITION[getParadoxCategory(equipment)];
      expect(getParadoxMaterialTable(equipment)).toHaveLength(max);
      expect(getParadoxPositionStats(equipment)).toHaveLength(max + 1);
    });
  });

  test("positions are labelled by grade and level", () => {
    expect(getParadoxPositionLabel(0)).toBe("Buy");
    expect(getParadoxPositionLabel(1)).toBe("Normal +0");
    expect(getParadoxPositionLabel(11)).toBe("Normal +10");
    expect(getParadoxPositionLabel(12)).toBe("Magic +0");
    expect(getParadoxPositionLabel(44)).toBe("Epic +10");
    expect(getParadoxPositionLabel(45)).toBe("Unique +0");
    expect(getParadoxPositionLabel(50)).toBe("Unique +5");
  });
});

describe(TAB_KEY.paradoxEquipment, () => {
  test("costs nothing until equipment is selected", () => {
    const { container } = renderScreen(TAB_KEY.paradoxEquipment);
    expect(total(container)).toBe(0);
  });

  test("buying everything and enhancing to Normal +10", () => {
    const { container } = renderScreen(TAB_KEY.paradoxEquipment);
    selectAllRows(container);
    chooseOption(getSelectByLabel(container, "To"), "Normal +10");
    // Armor 5 × (3 + 2×10) + weapon 2 × (10 + 5×10) + accessory 4 × (5 + 4×10)
    expect(total(container)).toBe(5 * 23 + 2 * 60 + 4 * 45);
  });

  test("evolving into Magic costs Upgrade Chip stones", () => {
    const { container } = renderScreen(TAB_KEY.paradoxEquipment);
    selectAllRows(container);
    chooseOption(getSelectByLabel(container, "From"), "Normal +10");
    chooseOption(getSelectByLabel(container, "To"), "Magic +0");
    // Armor 5 × 2 + weapon 2 × 4 + accessory 4 × 3
    expect(total(container)).toBe(30);
  });

  test("the full range is valid for every part", () => {
    const { container } = renderScreen(TAB_KEY.paradoxEquipment);
    selectAllRows(container);
    chooseOptionAt(getSelectByLabel(container, "To"), "last");
    expect(total(container)).toBeGreaterThan(0);
    expect(
      screen.queryByText("From cannot exceed the To option")
    ).not.toBeInTheDocument();
  });

  test("every reference panel opens", () => {
    const { container } = renderScreen(TAB_KEY.paradoxEquipment);
    openAllPanels(container);
    expect(
      container.querySelectorAll(
        ".ant-collapse-item:not(.ant-collapse-item-active)"
      )
    ).toHaveLength(0);
  });
});

describe(TAB_KEY.paradoxSkillJade, () => {
  test("defaults to Dreamy/Blood Moon/Verdure +0 to +10", () => {
    const { container } = renderScreen(TAB_KEY.paradoxSkillJade);
    expect(total(container)).toBe(66);
  });

  test("Ancient costs more", () => {
    const { container } = renderScreen(TAB_KEY.paradoxSkillJade);
    chooseOption(getSelectByLabel(container, "Jade"), "Ancient");
    expect(total(container)).toBe(445);
  });
});

describe(TAB_KEY.paradoxShop, () => {
  test("every shop panel opens", () => {
    const { container } = renderScreen(TAB_KEY.paradoxShop);
    openAllPanels(container);
    expect(screen.getByText("Frozen Paradox Trapezoid Rune")).toBeInTheDocument();
    expect(
      container.querySelectorAll(
        ".ant-collapse-item:not(.ant-collapse-item-active)"
      )
    ).toHaveLength(0);
  });
});
