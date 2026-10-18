import { act, render, screen } from "@testing-library/react";
import ServerTime, { formatServerTime } from "./ServerTime";

afterEach(() => {
  vi.useRealTimers();
});

test("formats in Singapore time whatever the local time zone", () => {
  // 23:30 UTC is already the next day in Singapore (UTC+8).
  expect(formatServerTime(new Date("2026-10-18T23:30:05Z"))).toBe(
    "Mon, 19 Oct 2026, 07:30:05"
  );
});

test("ticks every second", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-18T06:00:00Z"));
  render(<ServerTime />);
  expect(screen.getByText("Sun, 18 Oct 2026, 14:00:00")).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(2000);
  });
  expect(screen.getByText("Sun, 18 Oct 2026, 14:00:02")).toBeInTheDocument();
});
