// User flows on the Task screen.
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { TAB_KEY } from "../../../constants/Common.constants";
import { CHARACTER_STORE_VERSION } from "../../../constants/Character.constants";
import { TASK_STORE_VERSION } from "../../../constants/Task.constants";
import { LS_KEYS } from "../../../constants/localStorage.constants";
import { chooseOption, renderScreen } from "../../../testUtils";
import { saveCharacterStore } from "../../../utils/characterStorage.util";
import {
  formatDate,
  getToday,
  loadTaskStore,
  saveTaskStore,
} from "../../../utils/taskStorage.util";

const click = (element: Element) =>
  act(() => {
    fireEvent.click(element);
  });

// The antd Select of a form field in the open dialog.
const field = (id: string) =>
  document.querySelector<HTMLElement>(`#${id}`)!.closest<HTMLElement>(
    ".ant-select"
  )!;
const fieldText = (id: string) =>
  field(id).querySelector(".ant-select-selection-item")?.textContent;

beforeEach(() => {
  localStorage.clear();
  saveCharacterStore({
    version: CHARACTER_STORE_VERSION,
    groups: [
      { id: "g1", name: "MainID" },
      { id: "g2", name: "AltID" },
    ],
    characters: [
      { id: "c1", name: "Alice", level: 90, classId: "gladiator", groupId: "g1" },
      { id: "c2", name: "Bob", level: 80, classId: "sniper", groupId: "g2" },
    ],
  });
});

describe("Weekly Account", () => {
  test("adds a task with ID and character", async () => {
    const { store } = renderScreen(TAB_KEY.mainTask);
    click(screen.getByRole("button", { name: /Add/ }));
    chooseOption(field("taskId"), "Chaos Duel Nest");
    chooseOption(field("groupId"), "MainID");
    chooseOption(field("characterId"), "Alice - Lv.90 Gladiator");
    click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(store.getState().Task.entries).toEqual([
        expect.objectContaining({
          category: "weeklyAccount",
          taskId: "chaosDuelNest",
          groupId: "g1",
          characterId: "c1",
        }),
      ])
    );
    const row = screen.getByText("Chaos Duel Nest").closest("tr")!;
    expect(within(row).getByText("MainID")).toBeInTheDocument();
    expect(within(row).getByText("Alice")).toBeInTheDocument();
    expect(within(row).getByText("-")).toBeInTheDocument();
  });

  test("requires a task", async () => {
    const { store } = renderScreen(TAB_KEY.mainTask);
    click(screen.getByRole("button", { name: /Add/ }));
    click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Task is required")).toBeInTheDocument();
    expect(store.getState().Task.entries).toEqual([]);
  });

  test("clears the character when the ID changes to one without it", () => {
    renderScreen(TAB_KEY.mainTask);
    click(screen.getByRole("button", { name: /Add/ }));
    // Each dropdown is opened once: the test helper cannot reopen one.
    chooseOption(field("characterId"), "Alice - Lv.90 Gladiator");
    expect(fieldText("groupId")).toBe("MainID");

    chooseOption(field("groupId"), "AltID");
    expect(fieldText("characterId")).toBeUndefined();
  });

  test("picking a character first fills in its ID", () => {
    renderScreen(TAB_KEY.mainTask);
    click(screen.getByRole("button", { name: /Add/ }));
    chooseOption(field("characterId"), "Bob - Lv.80 Sniper");
    expect(fieldText("groupId")).toBe("AltID");
  });

  test("Done records today, Reset clears it, Delete removes the task", async () => {
    saveTaskStore({
      version: TASK_STORE_VERSION,
      entries: [
        { id: "t1", category: "weeklyAccount", taskId: "goldDragonNest" },
      ],
    });
    const { store } = renderScreen(TAB_KEY.mainTask);
    const row = () => screen.getByText("Gold Dragon Nest").closest("tr")!;

    click(within(row()).getByRole("button", { name: "Done" }));
    expect(store.getState().Task.entries[0].lastCleared).toBe(getToday());
    expect(within(row()).getByText(formatDate(getToday()))).toBeInTheDocument();

    click(within(row()).getByRole("button", { name: "Reset" }));
    expect(store.getState().Task.entries[0].lastCleared).toBeUndefined();

    click(within(row()).getByRole("button", { name: "Delete" }));
    const confirm = await screen.findByText("Delete this task?");
    click(
      within(confirm.closest(".ant-popover")! as HTMLElement).getByRole(
        "button",
        { name: "Delete" }
      )
    );
    await waitFor(() => expect(store.getState().Task.entries).toEqual([]));
  });
});

describe("taskStorage.util", () => {
  test("formats dates and shows a dash when missing", () => {
    expect(getToday(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(formatDate("2026-10-18")).toBe("18 Oct 2026");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("bad")).toBe("-");
  });

  test("drops unknown tasks and bad fields from storage", () => {
    localStorage.setItem(
      LS_KEYS.tasks,
      JSON.stringify({
        entries: [
          { id: "a", category: "weeklyAccount", taskId: "chaosDuelNest", lastCleared: "x" },
          { id: "b", category: "weeklyAccount", taskId: "removedTask" },
          "junk",
        ],
      })
    );
    expect(loadTaskStore().entries).toEqual([
      {
        id: "a",
        category: "weeklyAccount",
        taskId: "chaosDuelNest",
        groupId: undefined,
        characterId: undefined,
        lastCleared: undefined,
      },
    ]);
  });

  test("falls back to empty on unreadable storage", () => {
    localStorage.setItem(LS_KEYS.tasks, "{broken");
    expect(loadTaskStore().entries).toEqual([]);
  });
});
