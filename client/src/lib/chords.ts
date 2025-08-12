export type ChordName = string;
const KEYS = ["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"];
const DEGREE_ORDER = ["I","vi","IV","V"];
const CHROMA = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
function transpose(keyIndex:number, semis:number){ return CHROMA[(keyIndex+semis+12)%12]; }
export function generateProgression(key?: string): ChordName[] {
  const k = key && KEYS.includes(key) ? key : KEYS[Math.floor(Math.random()*KEYS.length)];
  const norm = k.replace("Db","C#").replace("Eb","D#").replace("Ab","G#");
  const keyIndex = CHROMA.indexOf(norm);
  const map:any = { I:0, vi:9, IV:5, V:7 };
  return DEGREE_ORDER.map((deg)=> {
    const root = transpose(keyIndex, map[deg]);
    const suffix = deg === "vi" ? "m" : "";
    return `${root}${suffix}`;
  });
}