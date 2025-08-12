import React, { useEffect, useRef, useState } from "react";
import { generateProgression, KEYS, ROMAN_TEMPLATES } from "../lib/chords";
import ChordDiagram from "../components/ChordDiagram";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { api } from "../lib/api";
export default function Home({ user }: { user: any | null }) {
  const [name, setName] = useState("My Progression");
  const [key, setKey] = useState(KEYS[0]);
  const [roman, setRoman] = useState(ROMAN_TEMPLATES[0]);
  const [chords, setChords] = useState<string[]>(generateProgression(key, roman));
  const [saved, setSaved] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const regenerate = () => setChords(generateProgression(key, roman));
  const editChord = (i:number, value:string) => {
    const arr = [...chords]; arr[i] = value; setChords(arr);
  };
  const loadSaves = async () => {
    const res = await api.get("/progressions"); setSaved(res.data);
  };
  useEffect(()=>{ if(user) loadSaves(); },[user]);

  const save = async () => {
    await api.post("/progressions", { name, key, roman, chords });
    await loadSaves();
    alert("Saved");
  };
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
      <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
        <label>Key: <select value={key} onChange={e=>setKey(e.target.value)}>{KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select></label>
        <label>Template: <select value={roman} onChange={e=>setRoman(e.target.value)}>{ROMAN_TEMPLATES.map(r=><option key={r} value={r}>{r}</option>)}</select></label>
        <label>Name: <input value={name} onChange={e=>setName(e.target.value)} /></label>
        <button onClick={regenerate}>Generate</button>
        {user && <button onClick={save}>Save</button>}
        <button onClick={exportPNG}>Export PNG</button>
        <button onClick={exportPDF}>Export PDF</button>
      </div>
      <div ref={containerRef}>
        <h2>{name} ({key})</h2>
        <div style={{ display: "flex", gap: 16 }}>
          {chords.map((c, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <input value={c} onChange={e=>editChord(i,e.target.value)} style={{ textAlign: "center" }} />
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
                <button onClick={()=>{setName(p.name||"");setKey(p.key||KEYS[0]);setRoman(p.roman||ROMAN_TEMPLATES[0]);setChords(p.chords);}}>{p.name || p.id}</button>
                <button onClick={()=>{api.delete(`/progressions/${p.id}`);loadSaves();}}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
