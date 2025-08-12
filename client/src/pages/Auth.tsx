import React, { useState } from "react";
import { api } from "../lib/api";
export default function AuthPage() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [mode, setMode] = useState<"login"|"register">("login");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") await api.post("/auth/register", { email, password: pw });
    await api.post("/auth/login", { email, password: pw });
    alert("Logged in."); setEmail(""); setPw("");
  };
  return (
    <div style={{ maxWidth: 360, margin: "2rem auto" }}>
      <h2>{mode}</h2>
      <form onSubmit={submit}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
        <input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)} /><br/>
        <button type="submit">{mode}</button>{" "}
        <button type="button" onClick={()=>setMode(mode==="login"?"register":"login")}>
          switch to {mode==="login"?"register":"login"}
        </button>
      </form>
    </div>
  );
}