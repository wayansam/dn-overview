// Backup & Transfer on the Setting screen.
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { TAB_KEY } from "../../../constants/Common.constants";
import { LS_KEYS } from "../../../constants/localStorage.constants";
import { renderScreen } from "../../../testUtils";
import { page } from "../../../utils/backup.util";

const click = (element: Element) =>
  act(() => {
    fireEvent.click(element);
  });

const characters = JSON.stringify({
  version: 1,
  characters: [
    { id: "c1", name: "Alice", level: 90, classId: "gladiator" },
  ],
  groups: [],
});

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

test("Export as text shows the backup of this browser", () => {
  localStorage.setItem(LS_KEYS.characters, characters);
  renderScreen(TAB_KEY.setting);
  click(screen.getByRole("button", { name: /Export as text/ }));
  const text = (screen.getByLabelText("Backup text") as HTMLTextAreaElement)
    .value;
  expect(JSON.parse(text)).toMatchObject({
    app: "dn-overview",
    data: { [LS_KEYS.characters]: characters },
  });
});

test("Export file downloads a JSON backup", () => {
  const createUrl = vi.fn(() => "blob:backup");
  const revokeUrl = vi.fn();
  Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: revokeUrl });
  const linkClick = vi
    .spyOn(HTMLAnchorElement.prototype, "click")
    .mockImplementation(() => {});
  renderScreen(TAB_KEY.setting);
  click(screen.getByRole("button", { name: /Export file/ }));
  expect(createUrl).toHaveBeenCalled();
  const link = linkClick.mock.instances[0] as unknown as HTMLAnchorElement;
  expect(link.download).toMatch(/^dn-overview-backup-\d{4}-\d{2}-\d{2}\.json$/);
  expect(revokeUrl).toHaveBeenCalledWith("blob:backup");
});

test("Import text asks first, then replaces the data and reloads", async () => {
  const reload = vi.spyOn(page, "reload").mockImplementation(() => {});
  localStorage.setItem(LS_KEYS.characters, characters);
  renderScreen(TAB_KEY.setting);
  click(screen.getByRole("button", { name: /Export as text/ }));
  const text = (screen.getByLabelText("Backup text") as HTMLTextAreaElement)
    .value;
  localStorage.clear();

  click(screen.getByRole("button", { name: /Import text/ }));
  act(() => {
    fireEvent.change(screen.getByLabelText("Backup text to import"), {
      target: { value: text },
    });
  });
  click(screen.getByRole("button", { name: "Import" }));

  // antd also renders the confirm title for screen readers, so take the first.
  const [confirm] = await screen.findAllByText(
    "Replace the data in this browser?"
  );
  const dialog = confirm.closest(".ant-modal")! as HTMLElement;
  expect(dialog).toHaveTextContent("1 character(s), 0 ID(s)");
  expect(localStorage.getItem(LS_KEYS.characters)).toBeNull();

  click(within(dialog).getByRole("button", { name: "Import" }));
  await waitFor(() => expect(reload).toHaveBeenCalled());
  expect(localStorage.getItem(LS_KEYS.characters)).toBe(characters);
});

test("Import text explains what is wrong with bad text", () => {
  renderScreen(TAB_KEY.setting);
  click(screen.getByRole("button", { name: /Import text/ }));
  act(() => {
    fireEvent.change(screen.getByLabelText("Backup text to import"), {
      target: { value: '{"hello":1}' },
    });
  });
  click(screen.getByRole("button", { name: "Import" }));
  expect(
    screen.getByText("This is not a DN Overview backup.")
  ).toBeInTheDocument();
});
