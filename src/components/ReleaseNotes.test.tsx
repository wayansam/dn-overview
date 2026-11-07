import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { TAB_KEY } from "../constants/Common.constants";
import allReducers from "../slice";
import {
  ReleaseNote,
  ReleaseType,
} from "../constants/ReleaseNotes.constants";
import ReleaseNotes, { dateValue, getWhatsNew } from "./ReleaseNotes";

// Pin "today" so What's New doesn't drift as real time passes.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 9, 20));
});

afterEach(() => {
  vi.useRealTimers();
});

const renderNotes = (onlyNew?: boolean) => {
  const store = configureStore({ reducer: allReducers });
  render(
    <Provider store={store}>
      <ReleaseNotes onlyNew={onlyNew} />
    </Provider>,
  );
  return store;
};

test("parses DD-MM-YYYY dates and treats missing ones as oldest", () => {
  expect(dateValue("4-11-2025")).toBe(20251104);
  expect(dateValue("31-08-2026")).toBeGreaterThan(dateValue("06-02-2026"));
  expect(dateValue(undefined)).toBe(0);
  expect(dateValue("Not Recorded")).toBe(0);
});

const note = (label: string, date: string): ReleaseNote => ({
  type: ReleaseType.N,
  category: "feature",
  label,
  date,
});

test("what's new keeps everything from the last 2 weeks", () => {
  const notes = [
    note("old", "20-10-2026"),
    ...["a", "b", "c", "d", "e", "f"].map((l) => note(l, "24-10-2026")),
  ];
  const result = getWhatsNew(notes, new Date(2026, 10, 7));
  expect(result.map((n) => n.label)).not.toContain("old");
  expect(result).toHaveLength(6);
});

test("what's new falls back to the 5 latest when the month is quiet", () => {
  const notes = [
    note("recent", "01-11-2026"),
    note("a", "01-09-2026"),
    note("b", "02-09-2026"),
    note("c", "03-09-2026"),
    note("d", "04-09-2026"),
    note("e", "05-09-2026"),
  ];
  const result = getWhatsNew(notes, new Date(2026, 10, 7));
  expect(result.map((n) => n.label)).toEqual(["recent", "e", "d", "c", "b"]);
});

test("widget is a plain list of what's new, newest first, with links", () => {
  const store = renderNotes(true);
  expect(screen.queryByPlaceholderText(/Search/)).not.toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();

  const items = document.querySelectorAll(".ant-list-item");
  expect(items.length).toBeGreaterThanOrEqual(5);
  expect(
    within(items[0] as HTMLElement).getByText(/Golden Enhancement Heraldry/),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByText("Rubinart Accessories Calculator"));
  expect(store.getState().UIState.selectedSideBar.key).toBe(
    TAB_KEY.eqRubinartAcc,
  );
});

test("release history search filters the table", () => {
  renderNotes();
  const tabPanel = screen.getByRole("tabpanel");
  fireEvent.change(within(tabPanel).getByPlaceholderText(/Search/), {
    target: { value: "bone dragon" },
  });
  const rows = within(tabPanel).getAllByRole("row").slice(1);
  expect(rows).toHaveLength(1);
});

test("release history splits functionality and app updates", () => {
  renderNotes();
  expect(screen.getByRole("tab", { name: /Functionality/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: /Update/ }));
  expect(
    screen.getAllByText("Phone friendly layout for the Character & Task tables and widgets").length,
  ).toBeGreaterThan(0);
});
