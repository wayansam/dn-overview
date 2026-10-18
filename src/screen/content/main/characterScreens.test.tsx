// User flows on the ID and Character screens, which manage the
// characters saved in localStorage.
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { TAB_KEY } from "../../../constants/Common.constants";
import { CHARACTER_STORE_VERSION } from "../../../constants/Character.constants";
import { LS_KEYS } from "../../../constants/localStorage.constants";
import { CharacterStore } from "../../../interface/Account.interface";
import {
  chooseOption,
  getSelectByPlaceholder,
  renderScreen,
} from "../../../testUtils";
import { saveCharacterStore } from "../../../utils/characterStorage.util";

const seed: CharacterStore = {
  version: CHARACTER_STORE_VERSION,
  groups: [{ id: "g1", name: "MainID" }],
  characters: [
    { id: "c1", name: "Alice", level: 90, classId: "gladiator", groupId: "g1" },
    { id: "c2", name: "Bob", level: 80, classId: "sniper", groupId: "g1" },
    { id: "c3", name: "Cara", level: 70, classId: "moonlord" },
  ],
  mainCharacterId: "c1",
};

const click = (element: Element) =>
  act(() => {
    fireEvent.click(element);
  });
const type = (element: Element, value: string) =>
  act(() => {
    fireEvent.change(element, { target: { value } });
  });

// Names in the General table, in display order.
const listedNames = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("tbody tr")).map(
    (row) => row.querySelector("td span")?.textContent
  );

beforeEach(() => {
  localStorage.clear();
  saveCharacterStore(seed);
});

describe("Character list", () => {
  test("lists characters and tags the main one", () => {
    const { container } = renderScreen(TAB_KEY.mainCharacter);
    expect(screen.getByText("Characters (3/25)")).toBeInTheDocument();
    expect(listedNames(container)).toEqual(["Alice", "Bob", "Cara"]);
    const aliceRow = screen.getByText("Alice").closest("tr")!;
    expect(within(aliceRow).getByText("Main")).toBeInTheDocument();
  });

  test("filters by name and clears the filter", () => {
    const { container } = renderScreen(TAB_KEY.mainCharacter);
    type(screen.getByPlaceholderText("Find by name"), "BO");
    expect(listedNames(container)).toEqual(["Bob"]);

    click(screen.getByText("Clear filters"));
    expect(listedNames(container)).toEqual(["Alice", "Bob", "Cara"]);
  });

  test("filters by class, base class and ID", () => {
    const { container } = renderScreen(TAB_KEY.mainCharacter);
    chooseOption(getSelectByPlaceholder(container, "Class"), "Moonlord");
    expect(listedNames(container)).toEqual(["Cara"]);

    click(screen.getByText("Clear filters"));
    chooseOption(getSelectByPlaceholder(container, "Base Class"), "Archer");
    expect(listedNames(container)).toEqual(["Bob"]);

    click(screen.getByText("Clear filters"));
    chooseOption(getSelectByPlaceholder(container, "ID"), "No ID");
    expect(listedNames(container)).toEqual(["Cara"]);
  });

  test("says so when no character matches", () => {
    renderScreen(TAB_KEY.mainCharacter);
    type(screen.getByPlaceholderText("Find by name"), "zzz");
    expect(screen.getByText("No character matches")).toBeInTheDocument();
  });

  test("Details opens that character in a modal", () => {
    renderScreen(TAB_KEY.mainCharacter);
    const bobRow = screen.getByText("Bob").closest("tr")!;
    click(within(bobRow).getByText("Details"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Name")).toHaveValue("Bob");
  });

  test("Add opens a blank character form in a modal", () => {
    renderScreen(TAB_KEY.mainCharacter);
    click(screen.getByRole("button", { name: /Add/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Name")).toHaveValue("");
  });

  // The phone layout (jsdom has no screen width) lists the optional columns
  // under each name, which makes their visibility and order easy to read.
  const details = (name: string) =>
    screen.getByText(name).closest("td")!.querySelector(".ant-typography-secondary")
      ?.textContent;

  test("lists every optional column by default", () => {
    renderScreen(TAB_KEY.mainCharacter);
    expect(details("Alice")).toBe(
      "Level: 90 · Class: Gladiator · Base Class: Warrior · ID: MainID"
    );
    expect(details("Cara")).toContain("ID: -");
  });

  test("column settings hide and reorder columns, and are saved", () => {
    renderScreen(TAB_KEY.mainCharacter);
    click(screen.getByRole("button", { name: /Columns/ }));
    const popover = document.querySelector(".ant-popover")! as HTMLElement;

    click(within(popover).getByText("Base Class"));
    expect(details("Alice")).toBe("Level: 90 · Class: Gladiator · ID: MainID");

    const levelRow = within(popover).getByText("Level").closest(".ant-space")!;
    const [, down] = within(levelRow as HTMLElement).getAllByRole("button");
    click(down);
    expect(details("Alice")).toBe("Class: Gladiator · Level: 90 · ID: MainID");

    expect(JSON.parse(localStorage.getItem(LS_KEYS.character_columns)!)).toEqual({
      order: ["classId", "level", "baseClass", "groupId"],
      visible: ["level", "classId", "groupId"],
    });
  });

  test("reads the older saved format (visible columns only)", () => {
    localStorage.setItem(LS_KEYS.character_columns, JSON.stringify(["classId"]));
    renderScreen(TAB_KEY.mainCharacter);
    expect(details("Alice")).toBe("Class: Gladiator");
  });

  test("drops unknown or repeated saved columns", () => {
    localStorage.setItem(
      LS_KEYS.character_columns,
      JSON.stringify({ order: ["bogus", "groupId", "groupId"], visible: "x" })
    );
    renderScreen(TAB_KEY.mainCharacter);
    expect(details("Alice")).toBe(
      "ID: MainID · Level: 90 · Class: Gladiator · Base Class: Warrior"
    );
  });

  test("falls back to the defaults when the saved setting is unreadable", () => {
    localStorage.setItem(LS_KEYS.character_columns, "{broken");
    renderScreen(TAB_KEY.mainCharacter);
    expect(details("Alice")).toBe(
      "Level: 90 · Class: Gladiator · Base Class: Warrior · ID: MainID"
    );
  });
});

describe("ID", () => {
  const openForm = () => {
    click(screen.getByRole("button", { name: /Add/ }));
    return screen.getByRole("dialog");
  };

  test("adds an ID", async () => {
    const { store } = renderScreen(TAB_KEY.mainId);
    const dialog = openForm();
    type(within(dialog).getByLabelText("Name"), "  AltID ");
    click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(store.getState().Character.groups.map((g) => g.name)).toEqual([
        "MainID",
        "AltID",
      ])
    );
    expect(screen.getByText("IDs (2/5)")).toBeInTheDocument();
  });

  test("rejects a name that is already used", async () => {
    const { store } = renderScreen(TAB_KEY.mainId);
    const dialog = openForm();
    type(within(dialog).getByLabelText("Name"), "mainid");
    click(within(dialog).getByRole("button", { name: "Save" }));

    expect(await within(dialog).findByText("Name is already used")).toBeInTheDocument();
    expect(store.getState().Character.groups).toHaveLength(1);
  });

  test("renames an ID", async () => {
    const { store } = renderScreen(TAB_KEY.mainId);
    click(screen.getByRole("button", { name: "Rename" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Name")).toHaveValue("MainID");

    type(within(dialog).getByLabelText("Name"), "Renamed");
    click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(store.getState().Character.groups[0].name).toBe("Renamed")
    );
  });

  test("lists each ID's characters and the ones without an ID", () => {
    renderScreen(TAB_KEY.mainId);
    const mainRow = screen.getByText("MainID").closest("tr")!;
    expect(within(mainRow).getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText(/1 character\(s\) have no ID/)).toBeInTheDocument();
  });

  test("deleting an ID keeps its characters", async () => {
    const { store } = renderScreen(TAB_KEY.mainId);
    click(screen.getByRole("button", { name: "Delete" }));
    expect(
      await screen.findByText(/2 character\(s\) are attached to this ID/)
    ).toBeInTheDocument();
    click(screen.getByRole("button", { name: "Yes" }));

    await waitFor(() => expect(store.getState().Character.groups).toEqual([]));
    expect(store.getState().Character.characters).toHaveLength(3);
  });

  test("Details opens the character", () => {
    const { store } = renderScreen(TAB_KEY.mainId);
    const bobRow = screen.getByText("Bob").closest("tr")!;
    click(within(bobRow).getByText("Details"));
    expect(store.getState().UIState.selectedSideBar.payload).toEqual({
      characterScreen: { characterId: "c2" },
    });
  });
});

describe("Character detail", () => {
  const field = (label: string) =>
    within(screen.getByRole("dialog")).getByLabelText(label);
  const openDetails = (name: string) =>
    click(within(screen.getByText(name).closest("tr")!).getByText("Details"));

  test("opens read-only, with class details", () => {
    renderScreen(TAB_KEY.mainCharacter);
    openDetails("Alice");
    expect(field("Name")).toHaveValue("Alice");
    expect(field("Name")).toBeDisabled();
    expect(screen.getByText("Warrior")).toBeInTheDocument();
  });

  test("opens the character requested by another screen", () => {
    const { store } = renderScreen(TAB_KEY.mainId);
    click(within(screen.getByText("Bob").closest("tr")!).getByText("Details"));
    expect(store.getState().UIState.selectedSideBar.key).toBe(
      TAB_KEY.mainCharacter
    );
  });

  test("creates a character", async () => {
    const { store } = renderScreen(TAB_KEY.mainCharacter);
    click(screen.getByRole("button", { name: /Add/ }));
    type(field("Name"), "Dan");
    type(field("Level"), "55");
    chooseOption(
      document.querySelector<HTMLElement>("#classId")!.closest(".ant-select")!,
      "Sniper"
    );
    click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Dan saved")).toBeInTheDocument();
    expect(store.getState().Character.characters.at(-1)).toMatchObject({
      name: "Dan",
      level: 55,
      classId: "sniper",
    });
  });

  test("validates the name", async () => {
    const { store } = renderScreen(TAB_KEY.mainCharacter);
    click(screen.getByRole("button", { name: /Add/ }));
    type(field("Name"), "bad name");
    click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Only letters and numbers")).toBeInTheDocument();

    type(field("Name"), "bob");
    expect(await screen.findByText("Name is already used")).toBeInTheDocument();
    expect(store.getState().Character.characters).toHaveLength(3);
  });

  test("edits a character", async () => {
    const { store } = renderScreen(TAB_KEY.mainCharacter);
    openDetails("Alice");
    click(screen.getByRole("button", { name: "Edit" }));
    type(field("Level"), "95");
    click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(store.getState().Character.characters[0].level).toBe(95)
    );
  });

  test("deletes a character after confirming", async () => {
    const { store } = renderScreen(TAB_KEY.mainCharacter);
    openDetails("Alice");
    click(screen.getByRole("button", { name: "Delete" }));
    const confirm = await screen.findByText("Delete Alice?");
    click(within(confirm.closest(".ant-popover")! as HTMLElement).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(store.getState().Character.characters.map((c) => c.id)).toEqual([
        "c2",
        "c3",
      ])
    );
    expect(store.getState().Character.mainCharacterId).toBeUndefined();
  });

  test("asks before discarding unsaved changes", async () => {
    const { store } = renderScreen(TAB_KEY.mainCharacter);
    openDetails("Alice");
    click(screen.getByRole("button", { name: "Edit" }));
    type(field("Level"), "1");
    expect(store.getState().UIState.hasUnsavedChanges).toBe(true);

    click(screen.getByRole("button", { name: "Close" }));
    expect(
      (await screen.findAllByText("Save current changes?")).length
    ).toBeGreaterThan(0);
    click(screen.getByRole("button", { name: "Discard" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(store.getState().UIState.hasUnsavedChanges).toBe(false);
    expect(store.getState().Character.characters[0].level).toBe(90);
  });
});
