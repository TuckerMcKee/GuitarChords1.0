import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import ReactDOMServer from "react-dom/server";
import ChordDiagram from "./ChordDiagram.tsx";

test("renders nothing for invalid chord", () => {
  const element = React.createElement(ChordDiagram, {
    chordName: "H#",
    id: "x",
  });
  const html = ReactDOMServer.renderToString(element);
  assert.equal(html, "");
});

test("renders div for valid chord", () => {
  const element = React.createElement(ChordDiagram, {
    chordName: "C",
    id: "y",
  });
  const html = ReactDOMServer.renderToString(element);
  assert.ok(html.includes('id="y"'));
});
