import React, { useEffect } from "react";
import { SVGuitarChord } from "svguitar";
import { getChordDiagram } from "../lib/diagrams.ts";

export default function ChordDiagram({
  chordName,
  id,
}: {
  chordName: string;
  id: string;
}) {
  const name = chordName.trim();
  const diagram = getChordDiagram(name);

  useEffect(() => {
    if (!diagram) return;
    const el = document.getElementById(id) as HTMLDivElement | null;
    if (!el) return;
    el.innerHTML = "";
    const chart = new SVGuitarChord(el);
    chart.chord({ ...diagram, title: name }).draw();
  }, [diagram, id, name]);

  if (!diagram) return null;
  return <div id={id} style={{ width: 180, height: 220 }} />;
}
