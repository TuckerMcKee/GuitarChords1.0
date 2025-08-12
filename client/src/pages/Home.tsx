import React, { useRef, useState } from "react";
import { generateProgression } from "../lib/chords";
import ChordDiagram from "../components/ChordDiagram";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { api } from "../lib/api";
export default function Home() {
  const [chords, setChords] = useState<string[]>(generateProgression());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const regenerate = () => setChords(generateProgression());
  const save = async () => { await api.post("/progressions", { name: "My Progression", chords }); alert("Saved"); };
  const exportPNG = async () => {
    if (!containerRef.current) return; const canvas = await html2canvas(containerRef.current);
    const a = document.createElement("a"); a.href = canvas.toDataURL("image/png"); a.download = "progression.png"; a.click();
  };
  const exportPDF = async () => {
    if (!containerRef.current) return; const canvas = await html2canvas(containerRef.current);
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height); pdf.save("progression.pdf");
  };
  return (
    <div style={{ padding: 16 }}>
      <h1>Four-Chord Generator</h1>
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <button onClick={regenerate}>Generate progression</button>
        <button onClick={save}>Save</button>
        <button onClick={exportPNG}>Export PNG</button>
        <button onClick={exportPDF}>Export PDF</button>
      </div>
      <div ref={containerRef} style={{ display: "flex", gap: 16 }}>
        {chords.map((c, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <strong>{c}</strong>
            <ChordDiagram chordName={c} id={`chord-${i}`} />
          </div>
        ))}
      </div>
    </div>
  );
}