export type ChordName = string;

export const KEYS = ["C","G","D","A","E","B","F#","Db","Ab","Eb","Bb","F"];
export const ROMAN_TEMPLATES = ["I-vi-IV-V","I-V-vi-IV","ii-V-I-I"];

const CHROMA = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const DEGREE_MAP: Record<string,{ semis:number; minor:boolean }> = {
  I: { semis:0, minor:false },
  ii: { semis:2, minor:true },
  iii:{ semis:4, minor:true },
  IV:{ semis:5, minor:false },
  V: { semis:7, minor:false },
  vi:{ semis:9, minor:true },
  vii:{ semis:11, minor:true }
};

function normalizeKey(k:string){
  return k.replace("Db","C#").replace("Eb","D#").replace("Gb","F#").replace("Ab","G#").replace("Bb","A#");
}

function transpose(keyIndex:number, semis:number){
  return CHROMA[(keyIndex + semis + 12)%12];
}

export function generateProgression(key:string, roman:string): ChordName[]{
  const chosenKey = KEYS.includes(key) ? key : KEYS[0];
  const norm = normalizeKey(chosenKey);
  const keyIndex = CHROMA.indexOf(norm);
  const degrees = roman.split("-");
  return degrees.map(d=>{
    const info = DEGREE_MAP[d];
    if(!info) return "";
    const root = transpose(keyIndex, info.semis);
    const suffix = info.minor ? "m" : "";
    return `${root}${suffix}`;
  });
}
