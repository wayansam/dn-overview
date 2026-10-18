// User flows on the Task screen.
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { TAB_KEY } from "../../../constants/Common.constants";
import { CHARACTER_STORE_VERSION } from "../../../constants/Character.constants";
import { TASK_STORE_VERSION } from "../../../constants/Task.constants";
import { LS_KEYS } from "../../../constants/localStorage.constants";
import { chooseOption, renderScreen } from "../../../testUtils";
import { addTask } from "../../../slice/Task.reducer";
import { formatGold } from "../../../utils/reward.util";
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
  document
    .querySelector<HTMLElement>(`#${id}`)!
    .closest<HTMLElement>(".ant-select")!;
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
      {
        id: "c1",
        name: "Alice",
        level: 90,
        classId: "gladiator",
        groupId: "g1",
      },
      { id: "c2", name: "Bob", level: 80, classId: "sniper", groupId: "g2" },
    ],
  });
});

// Both tables switch layout below antd's md breakpoint. jsdom has no screen
// width, so matchMedia is faked: "wide" matches every breakpoint, "phone"
// none (the default from setupTests).
const LAYOUTS = [
  ["wide", true],
  ["phone", false],
] as const;
const useLayout = (isWide: boolean) => {
  const original = window.matchMedia;
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      ...original(query),
      matches: isWide,
    })) as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = original;
  });
};

describe.each(LAYOUTS)("Weekly Account (%s)", (_, isWide) => {
  useLayout(isWide);

  test("phones list ID, character and date under the name", () => {
    saveTaskStore({
      version: TASK_STORE_VERSION,
      entries: [
        {
          id: "t1",
          category: "weeklyAccount",
          taskId: "goldDragonNest",
          groupId: "g1",
          characterId: "c1",
        },
      ],
      characterClears: {},
      characterFloors: {},
      excludedCharacters: {},
      hiddenActivities: [],
    });
    renderScreen(TAB_KEY.mainTask);
    const headers = within(
      screen.getByRole("region", { name: "Weekly [Account]" }),
    )
      .getAllByRole("columnheader")
      .map((el) => el.textContent);
    if (isWide) {
      expect(headers).toEqual([
        "Name",
        "ID",
        "Character",
        "Last Cleared",
        "Action",
      ]);
      expect(screen.getByRole("button", { name: "Done" })).toHaveTextContent(
        "Done",
      );
    } else {
      expect(headers).toEqual(["Name", "Action"]);
      expect(screen.getByText("MainID · Alice")).toBeInTheDocument();
      expect(screen.getByText("Last cleared: -")).toBeInTheDocument();
      // Icon-only, still named for screen readers.
      expect(screen.getByRole("button", { name: "Done" })).toHaveTextContent(
        "",
      );
    }
  });

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
      ]),
    );
    const row = screen.getByText("Chaos Duel Nest").closest("tr")!;
    expect(row).toHaveTextContent("MainID");
    expect(row).toHaveTextContent("Alice");
    expect(row).toHaveTextContent("-");
  });

  test("is limited to 20 tasks", () => {
    saveTaskStore({
      version: TASK_STORE_VERSION,
      entries: Array.from({ length: 20 }, (_, i) => ({
        id: `t${i}`,
        category: "weeklyAccount" as const,
        taskId: "chaosDuelNest",
      })),
      characterClears: {},
      characterFloors: {},
      excludedCharacters: {},
      hiddenActivities: [],
    });
    const { store } = renderScreen(TAB_KEY.mainTask);
    expect(screen.getByText("Weekly [Account] (20/20)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add/ })).toBeDisabled();

    act(() => {
      store.dispatch(
        addTask({ category: "weeklyAccount", taskId: "goldDragonNest" }),
      );
    });
    expect(store.getState().Task.entries).toHaveLength(20);
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
    expect(row()).toHaveTextContent(formatDate(getToday()));

    click(within(row()).getByRole("button", { name: "Reset" }));
    expect(store.getState().Task.entries[0].lastCleared).toBeUndefined();

    click(within(row()).getByRole("button", { name: "Delete" }));
    const confirm = await screen.findByText("Delete this task?");
    click(
      within(confirm.closest(".ant-popover")! as HTMLElement).getByRole(
        "button",
        { name: "Delete" },
      ),
    );
    await waitFor(() => expect(store.getState().Task.entries).toEqual([]));
  });
});

describe.each(LAYOUTS)("Weekly Character (%s)", (_, isWide) => {
  useLayout(isWide);

  test("uses a table on wide screens and a card per character on phones", () => {
    renderScreen(TAB_KEY.mainTask);
    expect(within(section()).queryByRole("table") !== null).toBe(isWide);
    expect(section().querySelectorAll(".ant-card")).toHaveLength(
      isWide ? 0 : 2,
    );
  });

  // The Weekly Character table, found by any activity column header.
  const section = () =>
    screen.getByRole("region", { name: "Weekly [Character]" });
  const row = (name: string) =>
    within(section()).getByText(name).closest("tr, .ant-card")! as HTMLElement;

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
    click(within(section()).getByRole("button", { name: /Customize/ }));
    chooseOption(
      document
        .querySelector<HTMLElement>("#exclude-fissionMaze")!
        .closest<HTMLElement>(".ant-select")!,
      "Bob",
    );
    click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(store.getState().Task.excludedCharacters.fissionMaze).toEqual([
        "c2",
      ]),
    );
    expect(within(row("Bob")).getAllByRole("checkbox")).toHaveLength(2);
    expect(within(row("Bob")).getByText("-")).toBeInTheDocument();
  });

  // The Customize popup's block for one activity.
  const activityBlock = (id: string) =>
    document.querySelector<HTMLElement>(`[data-activity="${id}"]`)!;

  test("Add All excludes every character from an activity", async () => {
    const { store } = renderScreen(TAB_KEY.mainTask);
    click(within(section()).getByRole("button", { name: /Customize/ }));
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
      ]),
    );
  });

  test("Hide removes an activity column, Show brings it back", async () => {
    const { store } = renderScreen(TAB_KEY.mainTask);
    click(within(section()).getByRole("button", { name: /Customize/ }));
    click(
      within(activityBlock("fissionMaze")).getByRole("button", {
        name: /Hide/,
      }),
    );
    click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(store.getState().Task.hiddenActivities).toEqual(["fissionMaze"]),
    );
    expect(
      screen.queryByRole("columnheader", { name: "Fission Maze" }),
    ).toBeNull();
    expect(within(row("Alice")).getAllByRole("checkbox")).toHaveLength(2);

    click(within(section()).getByRole("button", { name: /Customize/ }));
    await waitFor(() =>
      expect(
        within(activityBlock("fissionMaze")).getByRole("button", {
          name: /Show/,
        }),
      ).toBeInTheDocument(),
    );
    click(
      within(activityBlock("fissionMaze")).getByRole("button", {
        name: /Show/,
      }),
    );
    click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(store.getState().Task.hiddenActivities).toEqual([]),
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

    click(
      within(row("Alice")).getByRole("checkbox", {
        name: "Ark of Transcendence",
      }),
    );
    click(within(row("Alice")).getByRole("button", { name: "Reset" }));
    expect(store.getState().Task.characterClears).toEqual({});
    expect(store.getState().Task.characterFloors.c1).toEqual({
      arkOfTranscendence: "12",
    });

    click(within(row("Alice")).getByRole("button", { name: "Details" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Ark of Transcendence- (12F)",
    );
  });
});

describe("Weekly Rewards", () => {
  const section = () => screen.getByRole("region", { name: "Weekly Rewards" });

  test("asks for a floor when none is picked", () => {
    renderScreen(TAB_KEY.mainTask);
    expect(section()).toHaveTextContent(
      "Pick a Fission Maze or Ark of Transcendence floor",
    );
  });

  test("Customize keeps chosen resources shown, Show all lists the rest", async () => {
    saveTaskStore({
      version: TASK_STORE_VERSION,
      entries: [],
      characterClears: {},
      characterFloors: { c1: { fissionMaze: "Ascension 2F" } },
      excludedCharacters: {},
      hiddenActivities: [],
    });
    const { store } = renderScreen(TAB_KEY.mainTask);
    const items = () =>
      Array.from(section().querySelectorAll("tbody tr td:first-child")).map(
        (cell) => cell.textContent,
      );
    expect(items()).toEqual([
      "Gold",
      "Erosion Fragment",
      "Concentrated Erosion Fragment",
    ]);
    expect(
      within(section()).queryByRole("button", { name: /Show all/ }),
    ).toBeNull();

    click(within(section()).getByRole("button", { name: /Customize/ }));
    const dialog = await screen.findByRole("dialog");
    click(within(dialog).getByRole("button", { name: "Clear" }));
    click(within(dialog).getByLabelText("Erosion Fragment"));
    click(within(dialog).getByLabelText("Hero Coins"));
    click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(store.getState().Task.shownRewards).toEqual([
        "Erosion Fragment",
        "Hero Coins",
      ]),
    );
    expect(items()).toEqual(["Erosion Fragment", "Hero Coins"]);

    click(within(section()).getByRole("button", { name: /Show all/ }));
    expect(items()).toEqual([
      "Gold",
      "Erosion Fragment",
      "Concentrated Erosion Fragment",
      "Hero Coins",
    ]);
    click(within(section()).getByRole("button", { name: /Show selected/ }));
    expect(items()).toEqual(["Erosion Fragment", "Hero Coins"]);
  });

  test("sums the picked floors and updates when one is ticked", () => {
    saveTaskStore({
      version: TASK_STORE_VERSION,
      entries: [],
      characterClears: {},
      characterFloors: {
        c1: { fissionMaze: "Ascension 2F" },
        c2: { fissionMaze: "Ascension 2F" },
      },
      excludedCharacters: {},
      hiddenActivities: [],
    });
    renderScreen(TAB_KEY.mainTask);
    expect(section()).toHaveTextContent("0/2 cleared");
    const row = (name: string) =>
      within(section()).getByText(name).closest("tr")!;
    expect(row("Gold")).toHaveTextContent(
      formatGold(0) + formatGold(2 * 189750000),
    );
    expect(row("Concentrated Erosion Fragment")).toHaveTextContent("08 ~ 24");

    const aliceCard = within(
      screen.getByRole("region", { name: "Weekly [Character]" }),
    )
      .getByText("Alice")
      .closest(".ant-card")! as HTMLElement;
    click(within(aliceCard).getByRole("checkbox", { name: "Fission Maze" }));
    expect(section()).toHaveTextContent("1/2 cleared");
    expect(row("Erosion Fragment")).toHaveTextContent("3264");
  });
});

describe("Task widget", () => {
  // Only the Task widget on the General dashboard.
  beforeEach(() =>
    localStorage.setItem(
      LS_KEYS.general_widgets,
      JSON.stringify({ order: ["tasks"], visible: ["tasks"] }),
    ),
  );
  const part = (name: string) => screen.getByRole("region", { name });

  test("shows account progress and marks a pending task done", () => {
    saveTaskStore({
      version: TASK_STORE_VERSION,
      entries: [
        {
          id: "t1",
          category: "weeklyAccount",
          taskId: "goldDragonNest",
          groupId: "g1",
          characterId: "c1",
        },
        {
          id: "t2",
          category: "weeklyAccount",
          taskId: "chaosDuelNest",
          lastCleared: "2026-10-01",
        },
      ],
      characterClears: {},
      characterFloors: {},
      excludedCharacters: {},
      hiddenActivities: [],
    });
    const { store } = renderScreen(TAB_KEY.mainGeneral);
    const account = part("Weekly [Account] progress");
    expect(account).toHaveTextContent("1/2 done");
    expect(account).toHaveTextContent("Gold Dragon NestMainID · Alice");
    expect(account).not.toHaveTextContent("Chaos Duel Nest");

    click(within(account).getByRole("button", { name: "Done" }));
    expect(store.getState().Task.entries[0].lastCleared).toBe(getToday());
    expect(account).toHaveTextContent("2/2 done");
    expect(account).toHaveTextContent("All done");
  });

  test("counts characters per activity, skipping excluded and hidden", () => {
    saveTaskStore({
      version: TASK_STORE_VERSION,
      entries: [],
      characterClears: { c1: { fissionMaze: "2026-10-01" } },
      characterFloors: {},
      excludedCharacters: { arkOfTranscendence: ["c2"] },
      hiddenActivities: ["nightmare"],
    });
    renderScreen(TAB_KEY.mainGeneral);
    const progress = part("Weekly [Character] progress");
    const line = (id: string) =>
      progress.querySelector(`[data-activity="${id}"]`);
    expect(line("fissionMaze")).toHaveTextContent("Fission Maze1/2");
    expect(line("arkOfTranscendence")).toHaveTextContent(
      "Ark of Transcendence0/1",
    );
    expect(line("nightmare")).toBeNull();
  });

  test("lists only the always-shown rewards as cleared / total", () => {
    saveTaskStore({
      version: TASK_STORE_VERSION,
      entries: [],
      characterClears: { c1: { fissionMaze: "2026-10-01" } },
      characterFloors: {
        c1: { fissionMaze: "Ascension 2F" },
        c2: { fissionMaze: "Ascension 2F" },
      },
      excludedCharacters: {},
      hiddenActivities: [],
      shownRewards: ["Erosion Fragment", "Hero Coins"],
    });
    renderScreen(TAB_KEY.mainGeneral);
    const rewards = part("Weekly Rewards summary");
    const names = Array.from(rewards.querySelectorAll("[data-reward]")).map(
      (el) => el.getAttribute("data-reward")
    );
    expect(names).toEqual(["Erosion Fragment", "Hero Coins"]);
    expect(
      rewards.querySelector('[data-reward="Erosion Fragment"]')
    ).toHaveTextContent("Erosion Fragment32 / 64");
    expect(
      rewards.querySelector('[data-reward="Hero Coins"]')
    ).toHaveTextContent("Hero Coins0 / 0");
  });

  test("points to Customize until rewards are picked", () => {
    renderScreen(TAB_KEY.mainGeneral);
    expect(part("Weekly Rewards summary")).toHaveTextContent(
      "Pick the rewards to show with Customize in the Task tab"
    );
  });

  test("View all opens the Task tab", () => {
    const { store } = renderScreen(TAB_KEY.mainGeneral);
    click(screen.getByRole("button", { name: "View all" }));
    expect(store.getState().UIState.selectedSideBar.key).toBe(TAB_KEY.mainTask);
  });
});

describe("taskStorage.util", () => {
  test("formats dates and shows a dash when missing", () => {
    // Server time is UTC+8: 15:59 UTC is still the same day there, 16:00 is
    // already the next one.
    expect(getToday(new Date("2026-01-05T15:59:59Z"))).toBe("2026-01-05");
    expect(getToday(new Date("2026-01-05T16:00:00Z"))).toBe("2026-01-06");
    expect(getToday(new Date("2025-12-31T20:00:00Z"))).toBe("2026-01-01");
    expect(formatDate("2026-10-18")).toBe("18 Oct 2026");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("bad")).toBe("-");
  });

  test("drops unknown tasks and bad fields from storage", () => {
    localStorage.setItem(
      LS_KEYS.tasks,
      JSON.stringify({
        entries: [
          {
            id: "a",
            category: "weeklyAccount",
            taskId: "chaosDuelNest",
            lastCleared: "x",
          },
          { id: "b", category: "weeklyAccount", taskId: "removedTask" },
          "junk",
        ],
      }),
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
          c1: {
            nightmare: "2026-10-01",
            chaosDuelNest: "2026-10-01",
            fissionMaze: "x",
          },
          c2: "junk",
        },
        excludedCharacters: {
          nightmare: ["c1", 5],
          removed: ["c2"],
          fissionMaze: "x",
        },
      }),
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
      }),
    );
    expect(loadTaskStore().characterFloors).toEqual({
      c1: { fissionMaze: "Ascension 3-1F" },
    });
  });

  test("keeps only known shown rewards", () => {
    localStorage.setItem(
      LS_KEYS.tasks,
      JSON.stringify({
        shownRewards: ["Hero Coins", "Removed Item", 3, "Gold"],
      }),
    );
    expect(loadTaskStore().shownRewards).toEqual(["Gold", "Hero Coins"]);
    localStorage.setItem(LS_KEYS.tasks, JSON.stringify({}));
    expect(loadTaskStore().shownRewards).toBeUndefined();
  });

  test("falls back to empty on unreadable storage", () => {
    localStorage.setItem(LS_KEYS.tasks, "{broken");
    expect(loadTaskStore().entries).toEqual([]);
  });
});
