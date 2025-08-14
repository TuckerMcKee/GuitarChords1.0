import React, { useEffect, useRef, useState } from "react";
import { generateProgression, KEYS } from "../lib/chords";
import ChordDiagram from "../components/ChordDiagram";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { api } from "../lib/api";
import { getChordDiagram } from "../lib/diagrams";
export default function Home({ user }: { user: any | null }) {
  const [name, setName] = useState("My Progression");
  const [key, setKey] = useState(KEYS[0]);
  const initial = generateProgression(key);
  const [roman, setRoman] = useState(initial.roman);
  const [chords, setChords] = useState<string[]>(initial.chords);
  const [invalid, setInvalid] = useState<boolean[]>(
    initial.chords.map(() => false),
  );
  const [saved, setSaved] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const regenerate = () => {
    const next = generateProgression(key);
    setRoman(next.roman);
    setChords(next.chords);
    setInvalid(next.chords.map(() => false));
  };
  const editChord = (i: number, value: string) => {
    const arr = [...chords];
    arr[i] = value;
    const isValid = !!getChordDiagram(value.trim());
    const inv = [...invalid];
    inv[i] = !isValid;
    setChords(arr);
    setInvalid(inv);
  };
  const loadSaves = async () => {
    const res = await api.get("/progressions");
    setSaved(res.data);
  };
  useEffect(() => {
    if (user) loadSaves();
  }, [user]);
  useEffect(() => {
    const next = generateProgression(key);
    setRoman(next.roman);
    setChords(next.chords);
    setInvalid(next.chords.map(() => false));
  }, [key]);

  const save = async () => {
    await api.post("/progressions", { name, key, roman, chords });
    await loadSaves();
    alert("Saved");
  };
  const exportPNG = async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "progression.png";
    a.click();
  };
  const exportPDF = async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current);
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      canvas.width,
      canvas.height,
    );
    pdf.save("progression.pdf");
  };
  return (
    <div style={{ padding: 16 }}>
      <h1>Four-Chord Generator</h1>
      <div
        style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}
      >
        <label>
          Key:{" "}
          <select value={key} onChange={(e) => setKey(e.target.value)}>
            {KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label>
          Name: <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button onClick={regenerate}>Randomize</button>
        {user && <button onClick={save}>Save</button>}
        <button onClick={exportPNG}>Export PNG</button>
        <button onClick={exportPDF}>Export PDF</button>
      </div>
      <div ref={containerRef}>
        <h2>
          {name} ({key})
        </h2>
        <div style={{ display: "flex", gap: 16 }}>
          {chords.map((c, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <input
                value={c}
                onChange={(e) => editChord(i, e.target.value)}
                style={{
                  textAlign: "center",
                  borderColor: invalid[i] ? "red" : undefined,
                }}
              />
              {invalid[i] && (
                <div style={{ color: "red", fontSize: 12 }}>Invalid chord</div>
              )}
              <ChordDiagram chordName={c} id={`chord-${i}`} />
            </div>
          ))}
        </div>
      </div>
      {user && (
        <div style={{ marginTop: 24 }}>
          <h3>Saved Progressions</h3>
          <ul>
            {saved.map((p: any) => (
              <li key={p.id}>
                <button
                  onClick={() => {
                    setName(p.name || "");
                    setKey(p.key || KEYS[0]);
                    setRoman(p.roman || "");
                    setChords(p.chords);
                    setInvalid(p.chords.map(() => false));
                  }}
                >
                  {p.name || p.id}
                </button>
                <button
                  onClick={() => {
                    api.delete(`/progressions/${p.id}`);
                    loadSaves();
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
