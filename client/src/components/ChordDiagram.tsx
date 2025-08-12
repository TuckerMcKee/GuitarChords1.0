import React, { useEffect } from "react";
import { SVGuitarChord } from "svguitar";
import { getChordDiagram } from "../lib/diagrams";

export default function ChordDiagram({ chordName, id }: { chordName: string; id: string }) {
  useEffect(() => {
    const el = document.getElementById(id) as HTMLDivElement | null;
    if (!el) return;
    el.innerHTML = "";
    const chart = new SVGuitarChord(el);
    const diagram = getChordDiagram(chordName);
    if (diagram) {
      chart.chord({ ...diagram, title: chordName }).draw();
    } else {
      chart.chord({ fingers: [], barres: [], title: chordName }).draw();
    }
  }, [chordName, id]);
  return <div id={id} style={{ width: 180, height: 220 }} />;
}
