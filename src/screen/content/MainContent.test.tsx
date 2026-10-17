// Smoke test: every sidebar tab opens a real screen and renders without
// crashing. Catches screens broken by data or dependency changes, and tabs
// added to the sidebar without a screen behind them.
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { TAB_GROUP_LIST, TAB_KEY } from "../../constants/Common.constants";
import allReducers from "../../slice";
import { setSelectedSideBar } from "../../slice/UIState.reducer";
import MainContent from "./MainContent";

// jsdom has no canvas to draw on, so charts are stubbed out.
vi.mock("@ant-design/charts", () => ({
  Line: () => <div data-testid="chart" />,
}));

// Tabs listed in the sidebar on purpose before their screen exists; they
// show the "Crafting..." placeholder. Remove a tab here once it's built.
const WORK_IN_PROGRESS: string[] = [TAB_KEY.stageNSTG];

const tabs = TAB_GROUP_LIST.flatMap((group) =>
  group.children.map((tab) => ({ ...tab, group: group.name }))
);

const renderTab = (tab: (typeof tabs)[number]) => {
  const store = configureStore({ reducer: allReducers });
  store.dispatch(setSelectedSideBar(tab));
  return render(
    <Provider store={store}>
      <MainContent />
    </Provider>
  );
};

beforeEach(() => localStorage.clear());

test.each(tabs.filter((tab) => !WORK_IN_PROGRESS.includes(tab.key)))(
  "$group › $name renders",
  (tab) => {
    const { container } = renderTab(tab);
    expect(screen.queryByText("Crafting...")).not.toBeInTheDocument();
    expect(container).not.toBeEmptyDOMElement();
  }
);

test.each(tabs.filter((tab) => WORK_IN_PROGRESS.includes(tab.key)))(
  "$group › $name is still a placeholder",
  (tab) => {
    renderTab(tab);
    expect(screen.getByText("Crafting...")).toBeInTheDocument();
  }
);
