import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { vi, test, expect } from "vitest";
import Home from "./Home";

vi.mock("../components/ChordDiagram", () => ({
  default: ({ chordName }: { chordName: string }) => <div>{chordName}</div>,
}));

test("shows error for invalid chord input", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(<Home user={null} />, container);
  });
  const input = container.querySelector("input") as HTMLInputElement;
  act(() => {
    input.value = "H#";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(container.textContent).toContain("Invalid chord");
});
