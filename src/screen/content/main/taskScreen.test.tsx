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
      characterClears: {},
      excludedCharacters: {},
      hiddenActivities: [],
      characterFloors: {},
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

describe("Weekly Character", () => {
  // The Weekly Character table, found by any activity column header.
  const table = () =>
    screen
      .getAllByRole("columnheader", {
        name: /^(Fission Maze|Ark of Transcendence|Nightmare)$/,
      })[0]
      .closest("table")!;
  const row = (name: string) =>
    within(table()).getByText(name).closest("tr")! as HTMLElement;

  test("lists every character with a checkbox per activity", () => {
    renderScreen(TAB_KEY.mainTask);
    expect(within(row("Alice")).getAllByRole("checkbox")).toHaveLength(3);
    expect(within(row("Bob")).getAllByRole("checkbox")).toHaveLength(3);
  });

  test("checking saves today, unchecking removes it", () => {
    const { store } = renderScreen(TAB_KEY.mainTask);
    const box = within(row("Alice")).getByRole("checkbox", {
      name: "Nightmare",
    });
    click(box);
    expect(store.getState().Task.characterClears).toEqual({
      c1: { nightmare: getToday() },
    });
    expect(box).toBeChecked();

    click(box);
    expect(store.getState().Task.characterClears).toEqual({});
  });

  test("Reset clears every activity of that character only", () => {
    saveTaskStore({
      version: TASK_STORE_VERSION,
      entries: [],
      characterClears: {
        c1: { fissionMaze: "2026-10-01", nightmare: "2026-10-02" },
        c2: { nightmare: "2026-10-03" },
      },
      excludedCharacters: {},
      hiddenActivities: [],
      characterFloors: {},
    });
    const { store } = renderScreen(TAB_KEY.mainTask);
    click(within(row("Alice")).getByRole("button", { name: "Reset" }));
    expect(store.getState().Task.characterClears).toEqual({
      c2: { nightmare: "2026-10-03" },
    });
  });

  test("Details lists the date of each activity", () => {
    saveTaskStore({
      version: TASK_STORE_VERSION,
      entries: [],
      characterClears: { c1: { fissionMaze: "2026-10-01" } },
      excludedCharacters: { nightmare: ["c1"] },
      hiddenActivities: [],
      characterFloors: {},
    });
    renderScreen(TAB_KEY.mainTask);
    click(within(row("Alice")).getByRole("button", { name: "Details" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Fission Maze01 Oct 2026");
    expect(dialog).toHaveTextContent("Ark of Transcendence-");
    expect(dialog).toHaveTextContent("NightmareExcluded");
  });

  test("Customize excludes a character from an activity", async () => {
    const { store } = renderScreen(TAB_KEY.mainTask);
    click(screen.getByRole("button", { name: /Customize/ }));
    chooseOption(
      document
        .querySelector<HTMLElement>("#exclude-fissionMaze")!
        .closest<HTMLElement>(".ant-select")!,
      "Bob"
    );
    click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(store.getState().Task.excludedCharacters.fissionMaze).toEqual([
        "c2",
      ])
    );
    expect(within(row("Bob")).getAllByRole("checkbox")).toHaveLength(2);
    expect(within(row("Bob")).getByText("-")).toBeInTheDocument();
  });

  // The Customize popup's block for one activity.
  const activityBlock = (id: string) =>
    document.querySelector<HTMLElement>(`[data-activity="${id}"]`)!;

  test("Add All excludes every character from an activity", async () => {
    const { store } = renderScreen(TAB_KEY.mainTask);
    click(screen.getByRole("button", { name: /Customize/ }));
    const addAll = within(activityBlock("nightmare")).getByRole("button", {
      name: "Add All",
    });
    click(addAll);
    expect(addAll).toBeDisabled();
    click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(store.getState().Task.excludedCharacters.nightmare).toEqual([
        "c1",
        "c2",
      ])
    );
  });

  test("Hide removes an activity column, Show brings it back", async () => {
    const { store } = renderScreen(TAB_KEY.mainTask);
    click(screen.getByRole("button", { name: /Customize/ }));
    click(
      within(activityBlock("fissionMaze")).getByRole("button", { name: /Hide/ })
    );
    click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(store.getState().Task.hiddenActivities).toEqual(["fissionMaze"])
    );
    expect(
      screen.queryByRole("columnheader", { name: "Fission Maze" })
    ).toBeNull();
    expect(within(row("Alice")).getAllByRole("checkbox")).toHaveLength(2);

    click(screen.getByRole("button", { name: /Customize/ }));
    await waitFor(() =>
      expect(
        within(activityBlock("fissionMaze")).getByRole("button", {
          name: /Show/,
        })
      ).toBeInTheDocument()
    );
    click(
      within(activityBlock("fissionMaze")).getByRole("button", { name: /Show/ })
    );
    click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(store.getState().Task.hiddenActivities).toEqual([])
    );
  });

  test("only Fission Maze and Ark of Transcendence have a floor dropdown", () => {
    renderScreen(TAB_KEY.mainTask);
    const floors = within(row("Alice")).getAllByRole("combobox");
    expect(floors.map((el) => el.getAttribute("aria-label"))).toEqual([
      "Fission Maze floor",
      "Ark of Transcendence floor",
    ]);
  });

  test("picking a floor saves it, Reset keeps it, Details shows it", () => {
    const { store } = renderScreen(TAB_KEY.mainTask);
    const floorSelect = (label: string) =>
      within(row("Alice"))
        .getByRole("combobox", { name: label })
        .closest<HTMLElement>(".ant-select")!;
    chooseOption(floorSelect("Ark of Transcendence floor"), "12F");
    expect(store.getState().Task.characterFloors).toEqual({
      c1: { arkOfTranscendence: "12" },
    });

    click(within(row("Alice")).getByRole("checkbox", { name: "Ark of Transcendence" }));
    click(within(row("Alice")).getByRole("button", { name: "Reset" }));
    expect(store.getState().Task.characterClears).toEqual({});
    expect(store.getState().Task.characterFloors.c1).toEqual({
      arkOfTranscendence: "12",
    });

    click(within(row("Alice")).getByRole("button", { name: "Details" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Ark of Transcendence- (12F)"
    );
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

  test("keeps only known activities and valid dates", () => {
    localStorage.setItem(
      LS_KEYS.tasks,
      JSON.stringify({
        characterClears: {
          c1: { nightmare: "2026-10-01", chaosDuelNest: "2026-10-01", fissionMaze: "x" },
          c2: "junk",
        },
        excludedCharacters: { nightmare: ["c1", 5], removed: ["c2"], fissionMaze: "x" },
      })
    );
    const store = loadTaskStore();
    expect(store.characterClears).toEqual({ c1: { nightmare: "2026-10-01" } });
    expect(store.excludedCharacters).toEqual({ nightmare: ["c1"] });
  });

  test("keeps only floors that exist in the Stage data", () => {
    localStorage.setItem(
      LS_KEYS.tasks,
      JSON.stringify({
        characterFloors: {
          c1: {
            fissionMaze: "Ascension 3-1F",
            arkOfTranscendence: "99",
            nightmare: "1",
          },
        },
      })
    );
    expect(loadTaskStore().characterFloors).toEqual({
      c1: { fissionMaze: "Ascension 3-1F" },
    });
  });

  test("falls back to empty on unreadable storage", () => {
    localStorage.setItem(LS_KEYS.tasks, "{broken");
    expect(loadTaskStore().entries).toEqual([]);
  });
});
