// Shared helpers for screen-level tests.
import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import MainContent from "./screen/content/MainContent";
import allReducers from "./slice";
import { setSelectedSideBar } from "./slice/UIState.reducer";

// Renders the screen behind a sidebar tab, with a fresh store.
export const renderScreen = (key: string, name = key) => {
  const store = configureStore({ reducer: allReducers });
  store.dispatch(setSelectedSideBar({ key, name }));
  const view = render(
    <Provider store={store}>
      <MainContent />
    </Provider>
  );
  return { store, ...view };
};

// The antd Select that follows a text label, e.g. "From" / "To" / "Version".
export const getSelectByLabel = (container: HTMLElement, label: string) => {
  const row = Array.from(container.querySelectorAll("div")).find(
    (div) =>
      div.firstChild?.nodeType === Node.TEXT_NODE &&
      div.firstChild.textContent?.trim() === label &&
      div.querySelector(".ant-select")
  );
  if (!row) throw new Error(`No select labelled "${label}"`);
  return row.querySelector<HTMLElement>(".ant-select")!;
};

const openSelect = (select: HTMLElement) => {
  const input = select.querySelector("input")!;
  act(() => {
    fireEvent.mouseDown(select.querySelector(".ant-select-selector")!);
  });
  const press = (key: "ArrowDown" | "Enter") =>
    act(() => {
      fireEvent.keyDown(input, { key, keyCode: key === "Enter" ? 13 : 40 });
      // Leave the Select like a user clicking elsewhere would; otherwise the
      // next pick on the same Select is ignored.
      if (key === "Enter") fireEvent.blur(input);
    });
  // Position of the highlighted option, from ids like "rc_select_x_list_3".
  const activeIndex = () =>
    Number(input.getAttribute("aria-activedescendant")?.match(/_(\d+)$/)?.[1]);
  return { input, press, activeIndex };
};

// The antd Select showing a placeholder, e.g. the "Class" filter.
export const getSelectByPlaceholder = (
  container: HTMLElement,
  placeholder: string
) => {
  const select = Array.from(
    container.querySelectorAll<HTMLElement>(".ant-select")
  ).find(
    (el) =>
      el.querySelector(".ant-select-selection-placeholder")?.textContent ===
      placeholder
  );
  if (!select) throw new Error(`No select with placeholder "${placeholder}"`);
  return select;
};

// Opens an antd Select and picks the option at a position (0-based), or the
// last one.
export const chooseOptionAt = (select: HTMLElement, index: number | "last") => {
  const { press, activeIndex } = openSelect(select);
  if (index === "last") {
    // Arrow keys wrap around, so the last option is the one before 0.
    let previous = activeIndex();
    for (let step = 0; step < 500; step++) {
      press("ArrowDown");
      if (activeIndex() === 0) break;
      previous = activeIndex();
    }
    index = previous;
  }
  for (let step = 0; step < 500 && activeIndex() !== index; step++) {
    press("ArrowDown");
  }
  if (activeIndex() !== index) throw new Error(`No option at ${index}`);
  press("Enter");
};

// Opens an antd Select and picks the option with the given label. The
// dropdown is a virtual list that only renders the first few options in
// jsdom, so this moves through them with the arrow keys like a user would.
export const chooseOption = (select: HTMLElement, label: string) => {
  const { input, press } = openSelect(select);
  // The active option is always present in the dropdown's accessibility
  // list, even when the virtual list has not rendered it. Element ids are
  // not unique under test, so look it up inside the open dropdown only (the
  // newest one: a closed dropdown can linger while its animation runs).
  const active = () => {
    const dropdown = Array.from(
      document.querySelectorAll(
        ".ant-select-dropdown:not(.ant-select-dropdown-hidden)"
      )
    ).pop();
    const id = input.getAttribute("aria-activedescendant");
    const option = id && dropdown?.querySelector(`[role="option"][id="${id}"]`);
    return option ? option.getAttribute("aria-label") ?? option.textContent : null;
  };

  for (let step = 0; step < 500 && active() !== label; step++) {
    press("ArrowDown");
  }
  if (active() !== label) throw new Error(`No option labelled "${label}"`);
  press("Enter");
};

// Clicks every tab of every antd Tabs on the page, returning their labels.
export const visitAllTabs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(".ant-tabs-tab-btn")).map(
    (tab) => {
      act(() => {
        fireEvent.click(tab);
      });
      return tab.textContent ?? "";
    }
  );

// Ticks the "select all" checkbox of the first selectable table.
export const selectAllRows = (container: HTMLElement) => {
  const box = container.querySelector("thead .ant-checkbox-input");
  if (!box) throw new Error("No select-all checkbox");
  act(() => {
    fireEvent.click(box);
  });
};

// Amounts shown in every "Materials / Amount" table on the page. Amounts are
// whole numbers shown with locale separators, so only the digits are kept.
export const materialAmounts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("table"))
    .filter((table) => {
      const headers = Array.from(table.querySelectorAll("th")).map(
        (th) => th.textContent
      );
      return headers.includes("Materials") && headers.includes("Amount");
    })
    .flatMap((table) =>
      Array.from(table.querySelectorAll("tbody tr td:nth-child(2)")).map(
        (td) => Number((td.textContent ?? "").replace(/\D/g, "") || 0)
      )
    );
