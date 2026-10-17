import { render, screen } from "@testing-library/react";
import App from "./App";
import { TAB_GROUP_LIST } from "./constants/Common.constants";

test("renders the default screen title", () => {
  render(<App />);
  const defaultTab = TAB_GROUP_LIST[0].children[0];
  expect(
    screen.getByRole("heading", { level: 3, name: defaultTab.name })
  ).toBeInTheDocument();
});
