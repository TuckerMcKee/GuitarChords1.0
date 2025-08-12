import React, { useEffect } from "react";
import { Chord } from "svguitar";
export default function ChordDiagram({ chordName, id }: { chordName: string; id: string }) {
  useEffect(() => {
    const el = document.getElementById(id) as HTMLDivElement | null;
    if (!el) return;
    el.innerHTML = "";
    const chord = new Chord(el, { style: { color: "#111" } });
    chord.draw({ chord: [], fingers: [], barres: [], position: 0, name: chordName });
  }, [chordName, id]);
  return <div id={id} style={{ width: 180, height: 220 }} />;
}